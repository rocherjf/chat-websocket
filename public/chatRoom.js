const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('userName');

const socket = io();
const TYPING_TIMER_LENGTH = 2000; // ms

const EVENT_KEY_ENTER_KEYBOARD = 'Enter';

const dot = document.createElement('span');
dot.classList.add('dot');


// fields
const inputMessage = document.getElementById('chat__inputMessage');
const messages = document.getElementById('chat__messages');

// classe CSS
const CSS_CHAT_MSG = 'chat__msg';
const CSS_CHAT_MSG_SEND_ENVELOPPE = 'chat__msg_send-enveloppe';
const CSS_CHAT_MSG_SEND = 'chat__msg_send';
const CSS_CHAT_MSG_RECEIVE = 'chat__msg_receive';
const CSS_CHAT_MSG_RECEIVE_ENVELOPPE = 'chat__msg_receive-enveloppe';
const CSS_CHAT_LOG = 'log';
const CSS_CHAT_MSG_USERNAME = 'chat__msg_userName';


// est ce que l'utilisateur est en train de taper un message ?
let typing = false;


// ---------------------------
// -- Gestion des listeners --
// ---------------------------

// Gestion écriture de message en cours
inputMessage.addEventListener('input', updateTyping, false);

// Gestion envoi de message
window.addEventListener('keydown', (event) => {
  if (event.key === EVENT_KEY_ENTER_KEYBOARD) {
    sendMessage();
    socket.emit('stop typing');
    typing = false;
  }
});


// redirection si pas de pseudo renseigné
if (!userName) {
  window.location.assign(`index.html`);
}

socket.emit('add user', userName);


// -------------------------------------------------
//  -- Gestion des infos envoyées par le serveur --
// -------------------------------------------------

socket.on('new message', (data) => {
  addChatMessage(data);
});

socket.on('typing', (data) => {
  addChatTyping(data);
});

socket.on('stop typing', (data) => {
  removeChatTyping(data.userName);
});

socket.on('user joined', (data) => {
  ajouterInfoUtilisateurConnecte(data.userName);
});

socket.on('user left', (data) => {
  ajouterInfoUtilisateurDeconnecte(data.userName);
});


/**
 * Ajoute le message dans le fil de discussion et envoi le message au serveur
 */
function sendMessage() {
  const message = inputMessage.value;

  if (message) {
    // effacer le contenu du champ
    inputMessage.value = '';

    // Ajouter le message dans le chat
    addMyMessage({
      userName,
      message
    });

    // envoyer le nouveau message au serveur
    socket.emit('new message', message);
  }
}

/**
 * Ajout info sur l'utilisateur qui vient de se connecter
 * @param {*} userName
 */
function ajouterInfoUtilisateurConnecte(userName) {
  log(`${userName} s'est connecté.e`);
}

/**
 * Ajout dans le fil de discussion l'info sur la deconnexion d'un utilisateur
 * @param {*} userName
 */
function ajouterInfoUtilisateurDeconnecte(userName) {
  log(`${userName} s'est deconnecté.e`);
}

/**
 * Gestion des événements visibles dans le fil de discussion
 * @param {*} message
 */
function log(message) {
  const log = returnDivElementWitchClasses(CSS_CHAT_LOG);
  log.appendChild(document.createTextNode(message));

  ajouterElementDansChat(log);
}


/**
 * Gestion de l'événement écriture en cours
 */
function updateTyping() {
  if (!typing) {
    typing = true;
    socket.emit('typing');
  }
  lastTypingTime = (new Date()).getTime();

  setTimeout(() => {
    const typingTimer = (new Date()).getTime();
    const timeDiff = typingTimer - lastTypingTime;
    if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
      socket.emit('stop typing');
      typing = false;
    }
  }, TYPING_TIMER_LENGTH);
}

/**
 * Ajout d'un message de l'utilisateur dans le fil de discussion
 * @param {*} data
 */
function addMyMessage(data) {
  const message = returnDivElementWitchClasses(CSS_CHAT_MSG_SEND);
  message.appendChild(document.createTextNode(data.message));

  const messagEnveloppe = returnDivElementWitchClasses(CSS_CHAT_MSG_SEND_ENVELOPPE, CSS_CHAT_MSG);
  messagEnveloppe.appendChild(message);

  ajouterElementDansChat(messagEnveloppe);
}


/**
 * Ajout d'un message d'un autre utilisateur dans le fil de discussion
 * @param {*} data
 */
function addChatMessage(data) {
  const message = returnDivElementWitchClasses(CSS_CHAT_MSG_RECEIVE);
  message.appendChild(returnUserNameElement(data.userName));
  message.appendChild(document.createTextNode(`${data.message}`));


  const messagEnveloppe = returnDivElementWitchClasses(CSS_CHAT_MSG_RECEIVE_ENVELOPPE, CSS_CHAT_MSG);
  messagEnveloppe.appendChild(message);

  ajouterElementDansChat(messagEnveloppe);
}

/**
 * Ajout du message informant qu'un utilisateur est en train de rédiger un message
 * @param {*} data
 */
function addChatTyping(data) {
  const message = returnDivElementWitchClasses(CSS_CHAT_MSG_RECEIVE);
  message.appendChild(returnUserNameElement(data.userName));
  message.appendChild(dot.cloneNode(true));
  message.appendChild(dot.cloneNode(true));
  message.appendChild(dot.cloneNode(true));

  const messagEnveloppe = returnDivElementWitchClasses(CSS_CHAT_MSG_RECEIVE_ENVELOPPE, CSS_CHAT_MSG);
  messagEnveloppe.classList.add();
  messagEnveloppe.id = data.userName;
  messagEnveloppe.appendChild(message);

  ajouterElementDansChat(messagEnveloppe);
}

/**
 *  Renvoi un element de type span contenant le nom de l'emetteur du message
 * @param {String} userName - nom de l'emetteur
 * @return  {HTMLSpanElement}
 */
function returnUserNameElement(userName) {
  const userNameElement = document.createElement('span');
  userNameElement.classList.add(CSS_CHAT_MSG_USERNAME);
  userNameElement.appendChild(document.createTextNode(`${userName} : `));
  return userNameElement;
}

/**
 * Renvoi un element de type div
 * @param  {...any} classes   - les classes à appliquer à l'élément div
 * @return  {HTMLDivElement}
 */
function returnDivElementWitchClasses(...classes) {
  const div = document.createElement('div');
  classes.forEach((classCSS) =>
    div.classList.add(classCSS),
  );

  return div;
}

/**
 * Supprime du fil du discussion l'élement permettant de savoir qu'un utilisateur est en train d'écrire un message
 * @param {*} userName - nom de l'utilisateur
 */
function removeChatTyping(userName) {
  const inputMessage = document.getElementById(userName);
  if (inputMessage) {
    inputMessage.remove();
  }
}

/**
 * Ajoute un élément dans la fenêtre de discussion et fait descendre la scrollbar
 * @param {*} message - l'élément HTML à ajouter
 */
function ajouterElementDansChat(message) {
  messages.appendChild(message);
  majPositionScrollBar();
}

/**
 * Positionne la scrollbar au plus bas
 */
function majPositionScrollBar() {
  messages.scrollTop = messages.scrollHeight;
}