from flask import Flask, redirect, render_template, request, g
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from random import randint
import json
import sqlite3

app = Flask(__name__)
app.config["SECRET_KEY"] = "nff9ed298disnad29893r2n3mendd82h3dnf934f82hhf34ufn39f32937fni498g9f3fn23inf934f2n"
socketio = SocketIO(app)

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect('chess.db')

    return g.db

def make_new_match_id():
    ident = 1
    for game_match in get_db().execute("SELECT id_partida FROM partidas ORDER BY id_partida"):
        (i,) = game_match
        if ident != i:
            return ident

        ident += 1

    return ident

@socketio.on('first_connect')
def on_first_connection(msg):
    print(msg)

@socketio.on('connect')
def on_connect():
    user_id = request.sid
    print("User joined:", user_id)

    open_match = get_db().execute("SELECT id_partida FROM partidas WHERE id_jogador1 = (SELECT id_jogador FROM jogadores WHERE status = 0)").fetchone()

    if open_match is not None:
        (omid,) = open_match
        print("Found open match:", omid)

        get_db().execute("UPDATE partidas SET id_jogador2 = ? WHERE id_partida = ?", (user_id, omid))
        get_db().execute("INSERT INTO jogadores VALUES (?, 1)", (user_id,))
        get_db().execute("UPDATE jogadores SET status = 1 WHERE id_jogador = (SELECT id_jogador1 FROM partidas WHERE id_partida = ?)", (omid,))

        get_db().commit()

        join_room(omid)
        emit('set_color', 0, to=user_id)

        print("Starting the game", omid)

        emit('start_game', to=omid)

        return
    
    nmid = make_new_match_id()
    print("No open match found. Creating one:", nmid)

    get_db().execute("INSERT INTO partidas VALUES (?, ?, ?)", (nmid, user_id, user_id))
    get_db().execute("INSERT INTO jogadores VALUES (?, 0)", (user_id,))

    get_db().commit()

    join_room(nmid)
    emit('set_color', 1, to=user_id)

    print("Player on standby.")

    return

@socketio.on('piece_moved')
def on_piece_moved(data):
    print(data["boardInfo"])
    print("A pice got moved.\nPlayer who moved the piece:", data["id"])
    sender = data["id"]

    current_players = get_db().execute("SELECT id_jogador1, id_jogador2 FROM partidas WHERE id_jogador1 = ? OR id_jogador2 = ?", (sender, sender)).fetchone()

    (ply1, ply2) = current_players

    otherPlayer = ''
    if sender == ply1:
        otherPlayer = ply2
    elif sender == ply2:
        otherPlayer = ply1

    print("Sending update to", otherPlayer)
    emit('update_board', data["boardInfo"], to=otherPlayer)

    return

@socketio.on('disconnect')
def on_disconnect():
    user_id = request.sid
    print("User left:", user_id)

    get_db().execute("DELETE FROM jogadores WHERE id_jogador = ?", (user_id,))
    get_db().execute("DELETE FROM partidas WHERE id_jogador1 = ? OR id_jogador2 = ?", (user_id, user_id))
    get_db().commit()

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == "__main__":
    print("Running at http://127.0.0.1:5000/")
    socketio.run(app)
