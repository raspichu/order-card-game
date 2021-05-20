"use strict";
// -------------- Variables globales -------------- //
/**
 * @type {Array} cardArray Array donde se guardará el orden de las Cartas
 * @type {Boolean} hidden Variable donde se especifica si las cartas están mostradas o no
 * @type {Number} last Ultima carta vista para comprobar el orden
 * @type {Number} tries Número de intentos del jugador
 * @type {Number} score Puntuación del jugador
 * @type {Timer} timer Temporizador que reduce la puntuación de jugador
 * @type {specialNumber} specialNumber Número de cartas que se mostrarán en el "Modo Acumulativo"
 * @type {intervals} intervals Array de timers para animación del giro de cartas al inicio (antes de jugar)
 */
var cardArray = [];
var hidden = false;
var last = 0;
var tries = 1;
var score = 0;
var timer;
var specialNumber;
var intervals=[];

/**
 * Cuando carga la página inicia la función menuStart()
 * Añade la función click al botón de empezar, que limpia los resultados (los vuelve 0)
 * Inicia el juego en función de cuantas cartas o modo elijas
*/
$(document).ready(function(){
	menuStart();
	$('#start').click(function(){
		clear();
		restart();
		$('#result').html('');
		let cards = $('#number').val();
		if (cards!='0'){
			game(cards);
		} else {
			game(specialNumber,true);
		}
	});
});
// -------------- Funciones -------------- //
/**
 * Funcion para la animación antes de empezar la partida
 * Genera un número de cartas aleatorio en la pantalla (minimo 2)
 * Crea un intervalo de tiempo aleatorio para que la carta gire y lo guarda en un array para luego eliminarlo
 */
function menuStart(){
	let num = randomNumber(4)+2
	game(num);
	$('#hide').attr('disabled','true');
	for (let i = 0;i<num;i++){
		intervals.push(setInterval(function(){
			$('#'+i).parent().flip('toggle');
		},randomNumber(4000)+2000));
	}
}

/** Función para limpiar los intervalos creados en la función menuStart() */
function clear(){
	for(let interval of intervals){
		clearInterval(interval);
	}
}
/** Función que restaura las variables globales a su valor original */
function restart(){
	score = 0;
	last = 0;
	tries = 1;
	specialNumber=2;
	hidden = false;
	cardArray=[];
	clearInterval(timer);
}
/**
 * Función principal que genera los puntos del jugador y llama a otras funciones para randomizar y mostrar las cartas
 * @param  {Number} number  Numero de cartas con las que se jugará la partida
 * @param  {Boolean} special Boolean que dicta si es el modo acumulativo o no
 */
function game(number,special){
	special = special || false;
	cardArray=[];
	// Añade el número de cartas al array
	for (let i = 1;i<=number;i++){
		cardArray.push(i);
	}
	// Si no estamos en el modo especial, los puntos serán el número de cartas * 100
	// Si es el modo especial, y acaba de emepezar (la variable por defecto es 2), los puntos son 100;
	if (!special){
		score = number*100;
	} else {
		if (specialNumber==2){
			score=100;
		}
	}
	// Randomiza el array
	random(cardArray);
	// Muestra las cartas y espera el resultado, para mostrar si has ganado o perdido
	// En el caso de que psea el modo acumulativo, empieza otra partida a los 3 segundos y añade puntuación extra.
	show(cardArray,(bol)=>{
		if(bol){
			if (special && specialNumber<10){
				specialNumber++;
				score=score+(100*specialNumber)/4;
				endGame(true);
				setTimeout(function(){game(specialNumber,true)},3000);
			} else {
				endGame(true);
			}
		} else {
			endGame(false);
		}
	});
}
/**
 * Función que randomiza un array en si mismo usando una variable temporal
 * @param  {Array} array Array a randomizar
 * @return {Array}       Array randomizado
 */
function random(array) {
    for (let i = 0; i<array.length; i++) {
    	let j = randomNumber(i+1);
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
/**
 * Función usada para devolver un número aleatorio
 * @param  {Number} num Numero máximo que puede salir
 * @return {Number}     Numero aleatorio
 */
function randomNumber(num){
	return Math.floor(Math.random()*num);
}
/**
 * Función que genera el html para que se muestren las cartas en la pagina web
 * @param  {Array}   array Array de cartas a mostrar
 * @param  {Function} cb    Callback que devolverá el resultado cuando se acabe la partida
 */
function show(array,cb){
	let html='<div id="cards">';
	// Muestra la carta en función de su valor en el array
	for (let i = 0;i<array.length;i++){
		html+="<div class='cards'>";
			html+='<div class="front card" id="'+i+'"><img  src="./img/card_'+array[i]+'.png" /></div>';
			html+='<div class="back card" id="'+i+'"><img  src="./img/card_back.png" /></div>';
		html+='</div>';
	}
	html+='</div>';
	html+='<input type="button" value="Hide cards" class="hide show" id="hide">'
	$('#game').html(html);
	// Activa la función para voltear las cartas manualmente.
	$('.cards').flip({trigger:'manual'});

	// Para cuando se oculten las cartas
	$('#hide').click(function(e){
		if (!hidden){
			$('#result').html('<p>Tries: '+tries+'</p><p>Points: '+score+'</p>');
			// Le da la vuelta a la carta
			$('.cards').flip(true);
			// Oculta el reverso de la carta al terminar de darse la vuelta para que no se pueda mirar en el código fuente
			setTimeout(function(){$('.card>img').attr('src','./img/card_back.png')},200);
			$('#hide').attr('disabled','true');
			hidden=true;
			// Devuelve en la callback lo que devuelva la función play
			play((bol)=>{
				cb(bol);
			});
		}
	})
}
/** Función que usará el temporizador para restar la puntuación y mostrarla en la página web */
function scoreTimer(){
	score=score-5;
	$('#result').html('<p>Intento: '+tries+'</p><p>Points: '+score+'</p>');
}
/**
 * Función que llevará la partida del juego, mostrando las cartas al pulsar
 * @param  {Function} cb Callback para cuando acabe la partida devolviendo un boolean
 */
function play(cb){
	// Temporizador para restar puntuación cada segundo
	timer=setInterval(scoreTimer,1000);
	$('.card').click(function(e){
		// Id de la carta donde haces click
		let id = cardArray[$(this).attr('id')];
		// Cambia el dorso de la carta (oculto para evitar trampas) antes de darle la vuelta al adecuado
		$(this).siblings('.front').children().attr('src','./img/card_'+id+'.png');
		$(this).parent().flip(false);
		// En caso de que no sea el siguiente número al que pulsaste devuelve un false en la CallBack
		// Si no, prohibe el click en esa carta y continúa hasta que no queden cartas
		if (id!=last+1){
			cb(false);
		} else {
			last++;
			$(this).siblings('.front').off('click');
			if (last>=cardArray.length){
				cb(true);
			}
		}
	});
}
/**
 * Función que se encarga de mostrar cuando pierdes o ganas
 * @param  {Boolean} bol Boolean que dicta si has ganado o perdido
 */
function endGame(bol){
	clearInterval(timer);
	last = 0;
	hidden = false;
	$('#hide').attr('value','Ocultar Cartas');
	// Si ganas enseña la puntuación y los intentos y acaba el juego
	// Si pierdes te resta 100 puntos y te da la opción de continuar
	if (bol){
		$('#result').html('<h2>YOU WIN</h2><p>Tries: '+tries+'</p><p>Points: '+score+'</p>');
		$('#hide').attr('disabled',true);
	} else {
		tries++;
		$('.card').off('click');
		score=score-100;
		$('#result').html('<h2>YOU LOSE</h2><p>Tries: '+tries+'</p><p>Points: '+score+'</p>');
		$('#hide').attr('disabled',false);
	}
}