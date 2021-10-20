const unsernameInput = document.getElementById('login__unsername-input');
const EVENT_KEY_ENTER_KEYBOARD = 'Enter';

window.addEventListener('load', focusInput, false);

window.addEventListener('click', (event) => {
  if (event.target.id === 'login__button-next' && unsernameInput.value) {
    return window.location.assign(`chatRoom.html?userName=${unsernameInput.value}`);
  } else {
    focusInput();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === EVENT_KEY_ENTER_KEYBOARD && unsernameInput.value) {
    return window.location.assign(`chatRoom.html?userName=${unsernameInput.value}`);
  }
});

/**
 * Mettre le focus sur le champ username
 */
function focusInput() {
  unsernameInput.focus();
}
