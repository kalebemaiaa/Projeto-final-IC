# Kasparov ♔

<img src='https://img.shields.io/badge/Status-alpha-blueviolet' alt='shield status: alpha'>    <img src='https://img.shields.io/badge/License-V%20MIT-blueviolet' alt='shield status: v.1.0'>

## Vídeo Apresentação:
https://youtu.be/5j2eYfoWeQg

## Objetivo

Este trabalho objetivou desenvolver um jogo de xadrez através de uma interface web (com HTML, CSS e JS) e server em Python, construido com o framework
flask e a biblioteca flask-socketio para permitir o uso de web-sockets e interação multplayer.

## Tabuleiro

A parte gráfica do tabuleiro foi produzida fragmentando a tela em 8 div's que, novamente, foram divididas em outras 8 div's, inicialmente vazias e 
apenas com valores de background-color colocados. O tabuleiro foi desenvolvido e armazenado como uma matriz com posições nulas ou objetos, 
sendo que, cada objeto representa uma peça.

Tabuleiro como matriz:

~~~javascript
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
~~~

Tabuleiro gráfico:

~~~css
.row {
    display: flex;
}
.quadrado {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: #000 solid 1px;
}
~~~

### Peças

Cada peça é um objeto javascript com diferentes atríbutos, sendo que, por default cada peça tem 2 atributos: type, time. Além disso, algumas peças 
com movimentos especiais precisam de outros atributos, como o peão, que pode realizar o em passant, e o rei/torre, que pode realizar o roque e, por 
isso, precisam desses atributos extras para verificar se eles ja mexeram ou qual o número de movimento deles.

<img align=right height="100px" src="https://user-images.githubusercontent.com/81570326/174503406-feda1c0e-1155-486e-be4e-652d0f559576.png">
<img height="100px" src="https://user-images.githubusercontent.com/81570326/174501623-10e01cd0-62c8-4dc4-9efa-5d902688e1e6.png">


~~~javascript
{ type: "rainha", time: 0 },{ type: "rainha", time: 1 }
~~~


<img align=right height="100px" src="https://user-images.githubusercontent.com/81570326/174503448-0d7726d1-7d54-4902-85f0-63a99d0e1745.png">
<img height="100px" src="https://user-images.githubusercontent.com/81570326/174503517-66a842ce-7920-4fd7-9d75-fa49af551721.png">

~~~javascript
{ type: "rei", time: 0 },{ type: "rei", time: 1 }
~~~

<img align=right height="100px" src="https://user-images.githubusercontent.com/81570326/174503580-f3e368cc-a58e-4722-a6ab-93025bef8540.png">
<img height="100px" src="https://user-images.githubusercontent.com/81570326/174503550-b72971fe-94a8-4e3a-8c19-b6fc861adcc7.png">

~~~javascript
{ type: "torre", time: 0, "mexeu": false },{ type: "torre", time: 1, "mexeu": false }
~~~


<img align=right height="100px" src="https://user-images.githubusercontent.com/81570326/174503649-4fff96d5-f475-4799-bbf4-8e67b2b24701.png">
<img height="100px" src="https://user-images.githubusercontent.com/81570326/174503640-251b1abe-1bac-4ba1-ad94-9dfb6db8a0f6.png">

~~~javascript
{ type: "cavalo", time: 0 },{ type: "cavalo", time: 1 }
~~~

<img align=right height="100px" src="https://user-images.githubusercontent.com/81570326/174503628-1bcdae4f-58d6-402d-b368-a13e3d9bae23.png">
<img height="100px" src="https://user-images.githubusercontent.com/81570326/174503593-64afcc68-67a4-409a-9005-d2bb0b584920.png">

~~~javascript

{ type: "peao", time: 0 , movimento:{numero: 0, agora: false}},{ type: "peao", time: 1, movimento: {numero: 0, agora: false} }
~~~

## Jogo

### Ideia

A ideia para o desenvolvimento do jogo foi ter um estado inicial de tabuleiro comum, onde desenhamos esse estado inicial para o usuário, e para cada peça
criada adicionamos um eventListener que fica aguardando o envento onclick() em determinada peça, cada vez que uma peça mover chamamos um um evento do
flask_socketio que manda mensagem para o servidor, contendo o JSON do tabuleiro após o movimento, e ele responde mandando a mensagem para o outro jogador,
repetindo isso até que não seja mais possível jogar.

### Movimentos

Para realizar os movimentos,verificamos no eventListener da peça se o time do jogador é o mesmo da peça clickada e se o turno é verdadeiro (alterado
toda vez que ocorre um movimento), através de uma função que vê no tabuleiro as coordenadas clickadas, se ele passar na verificação, chamamos a função 
"mostrarMovimentos(coordenada)" para verificar e mostrar se há algum movimento possível para a peça clickada:

~~~javascript
imagem.addEventListener('click', (event) => {
    const coordenada_x = parseInt(event.composedPath()[1].id.slice(1, 3)[0]);
    const coordenada_y = parseInt(event.composedPath()[1].id.slice(1, 3)[1]);
    
    if (turno == false || tabuleiro[coordenada_x][coordenada_y].time != timeG) return;

    for (const classe of event.composedPath()[1].classList) {
        if (classe == "highlightEnemy") {
            matarInimigo(event.composedPath()[1].id.slice(1, 3));
            moverPeca(pecaClickada, event.composedPath()[1].id.slice(1, 3));
        }
    }

    mostrarMovimentos(event.composedPath()[1].id.slice(1, 3));
});
~~~

Após isso, verifica-se qual a peça e os seus possíveis movimentos, retornando uma lista com possíveis coordenadas. Caso essa peça possa se mexer para uma
coordenada, é necessário analisar se esse movimento futuro poderar causar cheque no seu rei e, se afirmativo, excluir essa possível jogada. Ademais, algo
que dificulta a implementação dos movimentos são casos especiais como o em passant, que exigem cuidados especias e, tratando esse casos, torna-se trivial
a realização de outras atividades, pois, após gerar funções que retornam todos possiveis movimentos de determinada peça, fazer o cheque é apenas analisar
se há alguem que pode chegar no rei.

Por fim, basta mostrar ao cliente onde ele pode jogar, algo feito iluminando as possíveis casas com as coordenadas das possíveis jogadas e implementar um
eventListener nesses quadrados (div's) que, caso estejam com determinada class (highlightEnemy ou highlight) na classList aconteça o movimento.

~~~javascript
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
~~~

### Comunicação

A comunicação é realizada através da biblioteca flask_socketio. Essa nos permite criar websockets, comunicações permanentes entre cliente e server, 
permitindo o envio de informações sem a necessidade de requisições http. A partir disso, construimos um sistema de eventos nos quais dois clientes se
comunicam com o server, de modo que ambos compartilhem um tabuleiro.

## Funcionamento

Para conseguir jogar, basta fazer o download do diretorio, entrar nele e rodar o comando:

```pip install -r requirements.txt```

Após instalar as dependências, ir ao terminal e rodar:

```python app.py```

E entrar na url impressa no terminal.

## Créditos

Autores:  
-Fernando de Magalhães Toledo (@Fernand0Toled0)  
-Kalebe Felipe Santana Maia (@kalebemaiaa)  
-Osmar Cardoso Lopes Filho (@OsmarCLFilho)
