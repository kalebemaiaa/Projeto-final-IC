const images = {
    "peao1": "../static/img/peao_branco.png",
    "bispo1": "../static/img/bispo_branco.png",
    "torre1": "../static/img/torre_branca.png",
    "rei1": "../static/img/rei_branco.png",
    "rainha1": "../static/img/rainha_branca.png",
    "cavalo1": "../static/img/cavalo_branco.png",
    "peao0": "../static/img/peao_preto.png",
    "bispo0": "../static/img/bispo_preto.png",
    "torre0": "../static/img/torre_preta.png",
    "rei0": "../static/img/rei_preto.png",
    "rainha0": "../static/img/rainha_preta.png",
    "cavalo0": "../static/img/cavalo_preto.png"
}

var socket = io();

let tabuleiro = [
    [{ type: "torre", time: 1, "mexeu": false }, { type: "cavalo", time: 1 }, { type: "bispo", time: 1 }, { type: "rei", time: 1, "mexeu": false },{ type: "rainha", time: 1 } , { type: "bispo", time: 1 }, { type: "cavalo", time: 1 }, { type: "torre", time: 1, "mexeu": false }],
    [{ type: "peao", time: 1 , movimento:{numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 1 , movimento: {numero: 0, agora: false}}],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [{ type: "peao", time: 0, movimento: {numero: 0, agora: false} }, { type: "peao", time: 0, movimento: {numero: 0, agora: false} }, { type: "peao", time: 0 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 0 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 0, movimento: {numero: 0, agora: false} }, { type: "peao", time: 0 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 0 , movimento: {numero: 0, agora: false}}, { type: "peao", time: 0, movimento: {numero: 0, agora: false} }],
    [{ type: "torre", time: 0, "mexeu": false }, { type: "cavalo", time: 0 }, { type: "bispo", time: 0 }, { type: "rei", time: 0, "mexeu": false }, { type: "rainha", time: 0 }, { type: "bispo", time: 0 }, { type: "cavalo", time: 0 }, { type: "torre", time: 0, "mexeu": false }]
]

const quadrados = document.querySelectorAll(".quadrado");

let paintThis = [];
let pecaClickada = null;
let turno = null;
let pecaEscolhidaPorPeao = null;
let coordenadaDesenharPecaEscolhida = null;
let timeG = null

const audio_1 = new Audio('../static/audio/audio_1.mpeg');
const audio_2 = new Audio('../static/audio/audio_2.mpeg');
const corneta = new Audio('../static/audio/corneta.mpeg');
const morte = new Audio('../static/audio/morte.mpeg');

const setColor = (argumento)=>{
    timeG = argumento;
    if(timeG == 1){
        turno = true
    }
    else{
        turno = false
    }
}

const desligaEspera = ()=>{
    document.querySelector(".aguardando").style = "display: none;"
    document.querySelector(".fundo_preto").style = "display: none;"
}

socket.on('connect', function() {
	socket.emit('first_connect', "I am connected!! :D")
});

socket.on('set_color', function(arg) {
	console.log("Setting color")
	setColor(arg);
});

socket.on('start_game', function() {
	console.log("Starting game")
	desligaEspera();
});

socket.on('update_board', function(board) {
	trocaTurno();

	for (const elemento of paintThis) {
		removerPeca(elemento.coordenadas);
    	}

	tabuleiro = JSON.parse(board);
	desenharTabuleiro();
});

function descobrindoPecas() {
    paintThis = [];

    for (let i = 0; i < tabuleiro.length; i++) {
        for (let k = 0; k < tabuleiro[i].length; k++) {
            if (tabuleiro[i][k] == null) {
                continue;
            }
            const coordenadasPecas = `${i}${k}`;

            paintThis.push({ coordenadas: coordenadasPecas, peca: tabuleiro[i][k] });
        }
    }
}

function cheque(position, time) {
    let controle = false;
    let possivelCasa = null;
    let posicoes = [];

    for (const posicao of possiveisMovimentosBispo(position)) {

        possivelCasa = tabuleiro[parseInt(posicao[0])][parseInt(posicao[1])];

        if (possivelCasa == null) continue;

        if (possivelCasa.time != time && (possivelCasa.type == "bispo" || possivelCasa.type == "rainha")) {
            controle = true;
            posicoes.push(possivelCasa);
        }
    }

    for (const posicao of possiveisMovimentosTorre(position)) {

        possivelCasa = tabuleiro[parseInt(posicao[0])][parseInt(posicao[1])];

        if (possivelCasa == null) continue;

        if (possivelCasa.time != time && (possivelCasa.type == "torre" || possivelCasa.type == "rainha")) {
            controle = true;
            posicoes.push(possivelCasa);
        }
    }

    for (const posicao of possiveisMovimentosCavalo(position)) {
        if (posicao == null) continue;

        possivelCasa = tabuleiro[parseInt(posicao[0])][parseInt(posicao[1])]

        if (possivelCasa == null) continue;

        if (possivelCasa.time != time && possivelCasa.type == "cavalo") {
            controle = true;
            posicoes.push(possivelCasa);
        }
    }

    if (time == 1) {
        const possiveisCoordenadas = [`${parseInt(position[0]) + 1}${parseInt(position[1]) + 1}`, `${parseInt(position[0]) + 1}${parseInt(position[1]) - 1}`]
        for (const posicao of possiveisCoordenadas) {
            if (posicao.includes('-') || posicao.includes('8')) continue;

            possivelCasa = tabuleiro[parseInt(posicao[0])][parseInt(posicao[1])]

            if (possivelCasa == null) continue;

            if (possivelCasa.time != time && possivelCasa.type == "peao") {
                controle = true;
                posicoes.push(possivelCasa);
            }
        }
    } else {
        const possiveisCoordenadas = [`${parseInt(position[0]) - 1}${parseInt(position[1]) + 1}`, `${parseInt(position[0]) - 1}${parseInt(position[1]) - 1}`]
        for (const posicao of possiveisCoordenadas) {
            if (posicao.includes('-') || posicao.includes('8')) continue;

            possivelCasa = tabuleiro[parseInt(posicao[0])][parseInt(posicao[1])]

            if (possivelCasa == null) continue;

            if (possivelCasa.time != time && possivelCasa.type == "peao") {
                controle = true;
                posicoes.push(possivelCasa);
            }
        }
    }

    return { "logico": controle, "quem": posicoes };
}

function posicoesReis() {
    posicoes = []
    for (let i = 0; i < tabuleiro.length; i++) {
        for (let k = 0; k < tabuleiro[i].length; k++) {
            if (tabuleiro[i][k] === null) {
                continue;
            }
            if (tabuleiro[i][k].type == "rei") {
                posicoes.push({ "posicao": `${i}${k}`, "time": tabuleiro[i][k].time })
            }
        }
    }
    return posicoes;
}

function trocaTurno() {
    if (turno == true) {
        turno = false;
        return socket.id
    }

    turno = true
    return 0
}

function desenhaPeca(type, lugar, time) {
    const imagem = document.createElement('img');

    imagem.setAttribute('src', images[`${type}${time}`]);
    imagem.classList.add('peca');

    imagem.addEventListener('click', (event) => {
        const coordenada_x = parseInt(event.composedPath()[1].id.slice(1, 3)[0]);
        const coordenada_y = parseInt(event.composedPath()[1].id.slice(1, 3)[1]);

	console.log(tabuleiro[coordenada_x][coordenada_y].time);
        if (turno == false || tabuleiro[coordenada_x][coordenada_y].time != timeG) return;

        for (const classe of event.composedPath()[1].classList) {
            if (classe == "highlightEnemy") {
                matarInimigo(event.composedPath()[1].id.slice(1, 3));
                moverPeca(pecaClickada, event.composedPath()[1].id.slice(1, 3));
            }
        }

        mostrarMovimentos(event.composedPath()[1].id.slice(1, 3));
    });

    document.querySelector(`#_${lugar}`).appendChild(imagem);
}

function removerPeca(lugar) {
    document.querySelector(`#_${lugar}`).removeChild(document.querySelector(`#_${lugar}`).lastChild);
}

function desenharTabuleiro() {
    descobrindoPecas();
    for (const elemento of paintThis) {
        desenhaPeca(elemento.peca.type, elemento.coordenadas, elemento.peca.time);
    }
}

function possiveisMovimentosPeao(posicao, time) {
    let positions = [];
    const posicao_x = parseInt(posicao[0]);
    const posicao_y = parseInt(posicao[1]);

    if(emPassant(posicao, time).logico){
        for(const pos of emPassant(posicao, time).posicoes){
            positions.push(pos);
        }
    }

    if (time == 0) {
        if (posicao_x == 0) return positions;
        if (tabuleiro[posicao_x - 1][posicao_y + 1] != null) {
            positions.push(`${posicao_x - 1}${posicao_y + 1}`);
        }
        if (tabuleiro[posicao_x - 1][posicao_y - 1] != null) {
            positions.push(`${posicao_x - 1}${posicao_y - 1}`);
        }
        if (posicao_x == 6) {
            if (tabuleiro[posicao_x - 1][posicao_y] != null) return positions;
            positions.push(`${posicao_x - 1}${posicao_y}`);
            if (tabuleiro[posicao_x - 2][posicao_y] != null) return positions;
            positions.push(`${posicao_x - 2}${posicao_y}`);
        } else {
            if (tabuleiro[posicao_x - 1][posicao_y] != null) return positions;
            positions.push(`${posicao_x - 1}${posicao_y}`);
        }
    } else {
        if (posicao_x == 7) return positions;
        if (tabuleiro[posicao_x + 1][posicao_y + 1] != null) {
            positions.push(`${posicao_x + 1}${posicao_y + 1}`);
        }
        if (tabuleiro[posicao_x + 1][posicao_y - 1] != null) {
            positions.push(`${posicao_x + 1}${posicao_y - 1}`);
        }
        if (posicao_x == 1) {
            if (tabuleiro[posicao_x + 1][posicao_y] != null) return positions;
            positions.push(`${posicao_x + 1}${posicao_y}`);
            if (tabuleiro[posicao_x + 2][posicao_y] != null) return positions;
            positions.push(`${posicao_x + 2}${posicao_y}`)
        } else {
            if (tabuleiro[posicao_x + 1][posicao_y] != null) return positions;
            positions.push(`${posicao_x + 1}${posicao_y}`);
        }
    }

    return positions;
}

function possiveisMovimentosTorre(posicao) {
    const posicao_x = parseInt(posicao[0]);
    const posicao_y = parseInt(posicao[1]);
    let positions = [];

    let x = posicao_x + 1;
    let y = posicao_y + 1;

    while (x < 8) {
        positions.push(`${x}${posicao_y}`);
        if (tabuleiro[x][posicao_y] != null) break;
        x++;
    }

    while (y < 8) {
        positions.push(`${posicao_x}${y}`);
        if (tabuleiro[posicao_x][y] != null) break;
        y++;
    }

    x = posicao_x - 1;
    y = posicao_y - 1;

    while (y > -1) {
        positions.push(`${posicao_x}${y}`);
        if (tabuleiro[posicao_x][y] != null) break;
        y--;
    }
    while (x > -1) {
        positions.push(`${x}${posicao_y}`);
        if (tabuleiro[x][posicao_y] != null) break;
        x--;
    }

    return positions;
}

function possiveisMovimentosCavalo(posicao) {
    const posicao_x = parseInt(posicao[0]);
    const posicao_y = parseInt(posicao[1]);
    let positions = [];

    for (const n of[2, -2]) {
        for (const k of[1, -1]) {
            positions.push(`${n + posicao_x}${k + posicao_y}`);
            positions.push(`${k + posicao_x}${n + posicao_y}`);
        }
    }

    for (let i = 0; i < positions.length; i++) {
        if (positions[i].includes('-') || positions[i].includes('8') || positions[i].includes('9')) {
            positions[i] = null;
        }
    }

    return positions;
}

function possiveisMovimentosBispo(posicao) {
    const posicao_x = parseInt(posicao[0]);
    const posicao_y = parseInt(posicao[1]);
    let positions = [];

    let x = posicao_x - 1;
    let y = posicao_y - 1;

    while (x > -1 && y > -1) {
        positions.push(`${x}${y}`);
        if (tabuleiro[x][y] != null) break;
        x--;
        y--;
    }

    x = posicao_x + 1;
    y = posicao_y - 1;
    while (x < 8 && y > -1) {
        positions.push(`${x}${y}`);
        if (tabuleiro[x][y] != null) break;
        x++;
        y--;
    }

    x = posicao_x - 1;
    y = posicao_y + 1;
    while (x > -1 && y < 8) {
        positions.push(`${x}${y}`);
        if (tabuleiro[x][y] != null) break;
        x--;
        y++;
    }

    x = posicao_x + 1;
    y = posicao_y + 1;
    while (x < 8 && y < 8) {
        positions.push(`${x}${y}`);
        if (tabuleiro[x][y] != null) break;
        x++;
        y++;
    }

    return positions;
}

function movimentosEmVolta(posicao) {
    const posicao_x = parseInt(posicao[0]);
    const posicao_y = parseInt(posicao[1]);
    let positions = [];

    for (let i = -1; i < 2; i++) {
        for (let k = -1; k < 2; k++) {
            if (i + posicao_x > 7 || i + posicao_x < 0 ||
                k + posicao_y > 7 || k + posicao_y < 0) continue;

            positions.push(`${i + posicao_x}${k + posicao_y}`);
        }
    }

    return positions;
}

function possiveisMovimentosRei(posicao) {
    let positions = movimentosEmVolta(posicao);

    const roques = verificaSePodeRoque(posicao);

    if (roques.pequeno) {
        positions.push(`${parseInt(posicao[0])}${parseInt(posicao[1]) + 2}`)
    }
    if (roques.grande) {
        positions.push(`${parseInt(posicao[0])}${parseInt(posicao[1]) - 2}`)
    }

    return positions;
}

function possiveisMovimentosRainha(posicao) {
    let positions = [];

    for (const position of movimentosEmVolta(posicao)) {
        positions.push(position);
    }
    for (const position of possiveisMovimentosBispo(posicao)) {
        positions.push(position);
    }
    for (const position of possiveisMovimentosTorre(posicao)) {
        positions.push(position);
    }

    return positions;
}

function iluminar(lista, time) {
    if (lista.length == 0) {
        return;
    }
    for (const elemento of lista) {
        if (elemento == null) {
            continue;
        }
        highlights(document.querySelector(`#_${elemento}`), time);
    }
}

function movimentoFake(deOnde, paraOnde, time) {
    if (deOnde == null || paraOnde == null) return;

    const x_old = parseInt(deOnde[0]);
    const y_old = parseInt(deOnde[1]);
    const x_new = parseInt(paraOnde[0]);
    const y_new = parseInt(paraOnde[1]);

    let peca = null;
    let controle = false;


    if (tabuleiro[x_new][y_new] != null) {
        if (tabuleiro[x_new][y_new].time == tabuleiro[x_old][y_old].time) return;
        peca = tabuleiro[x_new][y_new];
    }

    moverNoTabuleiro(deOnde, paraOnde);

    for (const rei of posicoesReis()) {
        if (rei.time == time) {
            if (cheque(rei.posicao, rei.time).logico) {
                controle = true;
            }
        }
    }

    moverNoTabuleiro(paraOnde, deOnde);
    tabuleiro[x_new][y_new] = peca;

    return controle;
}

function moverNoTabuleiro(deOnde, paraOnde) {
    const x_antigo = parseInt(deOnde[0]);
    const x_novo = parseInt(paraOnde[0]);
    const y_antigo = parseInt(deOnde[1]);
    const y_novo = parseInt(paraOnde[1]);

    tabuleiro[x_novo][y_novo] = tabuleiro[x_antigo][y_antigo];
    tabuleiro[x_antigo][y_antigo] = null;
}

function every(peca,deOnde, paraOnde){
    moverNoTabuleiro(deOnde, paraOnde);
    removerPeca(deOnde);
    desenhaPeca(peca.type, paraOnde, peca.time);
    limparHighlights();
    verifyCheque();
    descobrindoPecas();

    socket.emit('piece_moved', {boardInfo: voltaJson(), id: trocaTurno()});
}

function voltaJson(){
     const tabuleiroEmJson = JSON.stringify(tabuleiro);
     return tabuleiroEmJson
}

function moverPeca(deOnde, paraOnde) {
    const peca = tabuleiro[parseInt(deOnde[0])][parseInt(deOnde[1])];

    if (peca.time == 0) {
        audio_1.play();
    }
    else {
        audio_2.play();
    }

    if (peca.type == "rei") {

        console.log(deOnde, paraOnde)

        if (deOnde[1] == '3' && paraOnde[1] == '5') {
            every(peca,deOnde,paraOnde)
            moverPeca(`${deOnde[0]}7`, `${deOnde[0]}4`);

            return
        } else if (deOnde[1] == '3' && paraOnde[1] == '1') {
            every(peca,deOnde,paraOnde)
            moverPeca(`${deOnde[0]}0`, `${deOnde[0]}2`);

            return
        }
        peca.mexeu = true;

        every(peca,deOnde,paraOnde)

        return
    }
    else if (peca.type == "torre") {
        peca.mexeu = true;
        every(peca,deOnde,paraOnde)

        return
    }
    else if (peca.type == "peao"){
        peca.movimento.numero = peca.movimento.numero + 1;

        if (parseInt(paraOnde[0]) == 0 || parseInt(paraOnde[0]) == 7) {
            every(peca,deOnde,paraOnde)
            mudarPeca(peca.time);
            coordenadaDesenharPecaEscolhida = paraOnde;

            return
        }

        for(const linha of tabuleiro){
            for(const casa of linha){
                if(casa == null) continue;
                if(casa.type != "peao") continue;
                casa.movimento.agora = false;
            }
        }

        peca.movimento.agora = true;

        if(parseInt(paraOnde[1]) == parseInt(deOnde[1]) + 1 || parseInt(paraOnde[1]) == parseInt(deOnde[1]) - 1){
            let controle = false;

            for(const classe of document.querySelector(`#_${paraOnde}`).classList){
                if(classe == "highlight"){
                    controle = true;
                }
            }

            if(controle){
                if( peca.time == 0){
                        matarInimigo(`${parseInt(paraOnde[0]) + 1}${parseInt(paraOnde[1])}`)
                        every(peca,deOnde,paraOnde);
                        return
                    }
                    else{
                        matarInimigo(`${parseInt(paraOnde[0]) - 1}${parseInt(paraOnde[1])}`)
                        every(peca,deOnde,paraOnde);
                        return
                    }
            }

            every(peca,deOnde,paraOnde);
            return
        }
        else{
            every(peca,deOnde,paraOnde);
        }
    }
    else{
        every(peca,deOnde,paraOnde);

        return
    }
}

function verifyCheque(){
    for (const rei of posicoesReis()) {
        if (cheque(rei.posicao, rei.time).logico) {
	        corneta.play();

            if(chequeMate(rei.time)){
                /*
                MANDAR MENSAGEM FALANDO QUE ACABOU A PARTIDA
                FALAR QUEM GANHOU
                */
                document.querySelector(".fundo_preto").style = "display: flex;";
                return
            }

            document.querySelector('.cheque_alert').style = "display: flex;";
            document.querySelector('.fundo_preto').style = "display: flex;";

            setTimeout(() => {
                document.querySelector('.fundo_preto').style = "display: none;";
                document.querySelector('.cheque_alert').style = "display: none;";
            }, 2000)
        }
    }
}

function highlights(ondeIluminar, time) {
    const valor_x = parseInt(ondeIluminar.id[1]);
    const valor_y = parseInt(ondeIluminar.id[2]);

    if (ondeIluminar.children.length == 0) {
        ondeIluminar.classList.add('highlight');
        return true;
    } else {
        if (time != tabuleiro[valor_x][valor_y].time) {
            ondeIluminar.classList.add('highlightEnemy');
            return false;
        } else {
            return false;
        }
    }
}

function matarInimigo(posicaoInimigo) {
    const posicao_x = parseInt(posicaoInimigo[0]);
    const posicao_y = parseInt(posicaoInimigo[1]);

    tabuleiro[posicao_x][posicao_y] = null;

    document.querySelector(`#_${posicaoInimigo}`).removeChild(document.querySelector(`#_${posicaoInimigo}`).lastChild);

    morte.play();
}

function limparHighlights() {
    for (const quadrado of quadrados) {
        quadrado.classList.remove('highlight');
        quadrado.classList.remove('highlightEnemy');
    }
    pecaClickada = null;
}

function mostrarMovimentos(coordenada) {
    const pecaPassada = tabuleiro[parseInt(coordenada[0])][parseInt(coordenada[1])];

    limparHighlights();

    pecaClickada = coordenada;

    let listaParaIluminar = []
    switch (pecaPassada.type) {
        case "peao":
            listaParaIluminar = possiveisMovimentosPeao(coordenada, pecaPassada.time);
            break;
        case "torre":
            listaParaIluminar = possiveisMovimentosTorre(coordenada);
            break;
        case "cavalo":
            listaParaIluminar = possiveisMovimentosCavalo(coordenada);
            break;
        case "bispo":
            listaParaIluminar = possiveisMovimentosBispo(coordenada);
            break;
        case "rei":
            listaParaIluminar = possiveisMovimentosRei(coordenada);
            break;
        case "rainha":
            listaParaIluminar = possiveisMovimentosRainha(coordenada);
            break;
        default:
            break;
    }

    for (let i = 0; i < listaParaIluminar.length; i++) {
        if (movimentoFake(coordenada, listaParaIluminar[i], pecaPassada.time)) {
            listaParaIluminar[i] = null;
        }
    }
    iluminar(listaParaIluminar, pecaPassada.time);
}

function removendo() {
    for (const elemento of document.querySelectorAll(".container_container")) {
        for (const filhos of elemento.children[0].children) {
            filhos.className = "";
        }
        for (const filhos of elemento.children[1].children) {
            filhos.className = "";
        }
    }
}

function colocaDiv(pai) {
    const div = document.createElement('div');
    pai.appendChild(div);
}

function criaContentBorders(pai) {
    const divContentBorders = document.createElement('div');

    divContentBorders.classList.add('container_borders');

    for (let i = 0; i < 2; i++) {
        colocaDiv(divContentBorders);
    }

    pai.appendChild(divContentBorders);
}

function criaContainerContainer(image) {
    const divContainerContainer = document.createElement('div');
    divContainerContainer.classList.add('container_container');

    for (let i = 0; i < 2; i++) {
        criaContentBorders(divContainerContainer);
    }

    const imagem = document.createElement('img');
    imagem.setAttribute('src', image);
    imagem.classList.add('image_teste');

    imagem.onclick = () => {
        const image_def = imagem.src.split('/')[imagem.src.split('/').length - 1].split('.')[0].split('_');

        if (image_def[1] == "preta" || image_def[1] == "preto") {
            pecaEscolhidaPorPeao = [image_def[0], '0'];
        } else {
            pecaEscolhidaPorPeao = [image_def[0], '1'];
        }
    };

    divContainerContainer.appendChild(imagem);

    document.querySelector('.show').insertBefore(divContainerContainer, document.querySelector('.show').firstChild);
}

function definindoImages(time) {
    for (const img in images) {
        if (img.includes(`${time}`)) {
            if (img.includes('rei') || img.includes('peao')) continue;
            criaContainerContainer(images[img])
        }
    }
}

function exibindoImagem(time) {
    definindoImages(time)

    document.querySelectorAll(".container_container").forEach((quadrado) => {
        quadrado.onclick = () => {
            removendo()
            quadrado.children[0].children[0].classList.add("border_left_top");
            quadrado.children[0].children[1].classList.add("border_left_bottom");
            quadrado.children[1].children[0].classList.add("border_right_top");
            quadrado.children[1].children[1].classList.add("border_right_bottom");
            pecaEscolhida = quadrado.children[2].src;
        }
    })
}

function mudarPeca(time) {
    document.querySelector('.box_container').style = "display: flex;"
    document.querySelector('.fundo_preto').style = "display: flex;"
    exibindoImagem(time);
}

function verificaSePodeRoque(posicao) {
    let grande = true;
    let pequeno = true;

    const x = parseInt(posicao[0]);
    let y = parseInt(posicao[1]);

    if (tabuleiro[x][y].mexeu) {
        return { "pequeno": false, "grande": false }
    }

    if (tabuleiro[x][7] == null) {
        pequeno = false;
    } else if (tabuleiro[x][7].type != "torre") {
        pequeno = false;
    } else {
        if (tabuleiro[x][7].mexeu) {
            pequeno = false;
        }
    }

    if (tabuleiro[x][0] == null) {
        grande = false;
    } else if (tabuleiro[x][0].type != "torre") {
        grande = false;
    } else {
        if (tabuleiro[x][0].mexeu) {
            grande = false;
        }
    }

    y -= 1;
    while (y > 0) {
        if (tabuleiro[x][y] != null) {
            grande = false;
            break;
        }
        y--;
    }

    y = parseInt(posicao[1]) + 1;
    while (y < 7) {
        if (tabuleiro[x][y] != null) {
            pequeno = false;
            break;
        }
        y++;
    }

    return { "pequeno": pequeno, "grande": grande }
}

function emPassant(posicao, time){
    const x = parseInt(posicao[0]);
    const y = parseInt(posicao[1]);

    let positions = []

    if(time == 1 && x != 4) return false;
    if(time == 0 && x != 3) return false;

    for(const posicaoY of [-1, 1]){
        if(y + posicaoY < 0 || y + posicaoY > 7) continue;

        if(tabuleiro[x][y + posicaoY] == null) continue;

        if(tabuleiro[x][y + posicaoY].type != "peao" || tabuleiro[x][y + posicaoY].time == time) continue;

        if(tabuleiro[x][y + posicaoY].movimento.numero != 1){
            continue;
        }

        if(tabuleiro[x][y + posicaoY].movimento.agora != true){
            continue;
        }

        if( time == 0){
            positions.push(`${x - 1}${y + posicaoY}`);
        }
        else{
            positions.push(`${x + 1}${y + posicaoY}`);
        }
    }

    if(positions.length == 0) return {logico: false};
    return {logico: true, posicoes: positions};
}

function chequeMate(time){
    let pecas = [];
    let movimentosPossiveis = [];

    for(let i = 0; i < tabuleiro.length ; i++){
        for(let k = 0 ; k< tabuleiro[i].length; k++){
            if(tabuleiro[i][k] == null) continue;
            if(tabuleiro[i][k].time != time) continue;
            pecas.push({tipo: tabuleiro[i][k].type, posicao:`${i}${k}`, time:tabuleiro[i][k].time});
        }
    }

    for(const peca of pecas){
        switch(peca.tipo){
            case "peao":
                for(const pos of possiveisMovimentosPeao(peca.posicao, peca.time)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            case "torre":
                for(const pos of possiveisMovimentosTorre(peca.posicao)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            case "bispo":
                for(const pos of possiveisMovimentosBispo(peca.posicao)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            case "cavalo":
                for(const pos of possiveisMovimentosCavalo(peca.posicao)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            case "rainha":
                for(const pos of possiveisMovimentosRainha(peca.posicao)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            case "rei":
                for(const pos of possiveisMovimentosRei(peca.posicao)){
                    movimentosPossiveis.push({deOnde:peca.posicao ,paraOnde:pos, time:peca.time});
                }
                break;
            default:
                break;
        }
    }

    for (let i = 0; i < movimentosPossiveis.length; i++) {
        if(movimentosPossiveis[i].deOnde == null || movimentosPossiveis[i].paraOnde == null) continue;
        const old_x = parseInt(movimentosPossiveis[i].deOnde[0])
        const old_y = parseInt(movimentosPossiveis[i].deOnde[1])
        const new_x = parseInt(movimentosPossiveis[i].paraOnde[0])
        const new_y = parseInt(movimentosPossiveis[i].paraOnde[1])

        if(tabuleiro[new_x][new_y] == null){
            if (! movimentoFake(movimentosPossiveis[i].deOnde, movimentosPossiveis[i].paraOnde, movimentosPossiveis[i].time)) {
                return false
            }
        }
        else{
            if(tabuleiro[old_x][old_y].time == tabuleiro[new_x][new_y].time) continue;
            if (! movimentoFake(movimentosPossiveis[i].deOnde, movimentosPossiveis[i].paraOnde, movimentosPossiveis[i].time)) {
                return false;
            }
        }
    }

    return true;
}

quadrados.forEach((quadrado) => {
    quadrado.addEventListener('click', () => {
        for (const classe of quadrado.classList) {
            if (classe == 'highlight') {
                moverPeca(pecaClickada, quadrado.id.slice(1, 3));
            } else if (classe == 'highlightEnemy') {
                matarInimigo(quadrado.id.slice(1, 3));
                moverPeca(pecaClickada, quadrado.id.slice(1, 3));
            }
        }
    })
})

document.querySelector("#btn").onclick = () => {
    if (pecaEscolhidaPorPeao === null) return;

    document.querySelector('.box_container').style = "display: none;"
    document.querySelector('.fundo_preto').style = "display: none;"

    removerPeca(coordenadaDesenharPecaEscolhida);
    desenhaPeca(pecaEscolhidaPorPeao[0], coordenadaDesenharPecaEscolhida, pecaEscolhidaPorPeao[1]);
    const x = parseInt(coordenadaDesenharPecaEscolhida[0]);
    const y = parseInt(coordenadaDesenharPecaEscolhida[1]);
    tabuleiro[x][y] = { "type": pecaEscolhidaPorPeao[0], "time": pecaEscolhidaPorPeao[1] };

    for (let i = 0; i < 4; i++) {
        document.querySelector('.show').removeChild(document.querySelector('.show').firstChild)
    }
    coordenadaDesenharPecaEscolhida = null;
    pecaEscolhidaPorPeao = null;
}

desenharTabuleiro();
