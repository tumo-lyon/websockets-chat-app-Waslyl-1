import { addUserMessageToFeed, addSystemMessageToFeed } from "./messages.js";
import { setTypingIndicator } from "./typing.js";

document.addEventListener('DOMContentLoaded', () => {
	const socket = io();

	const messageForm = document.getElementById('message-form');

	const inputElement = document.getElementById('message-input');
	let typingTimeout;

	inputElement.addEventListener('input', () => {
		clearTimeout(typingTimeout);
		socket.emit('typing_start');

		typingTimeout = setTimeout(() => {
			socket.emit('typing_stop');
		}, 3000);
	});

	messageForm?.addEventListener('submit', (event) => {
		event.preventDefault();

		const messageInput = document.getElementById('message-input');
		const message = messageInput.value;

		socket.emit('user_message_send', {
			content: message,
		});

		messageInput.value = '';
	});

	socket.on('connect', () => {
		console.log('Connected to server');
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from server');
	});

	socket.on('user_message', addUserMessageToFeed);
	socket.on('system_message', addSystemMessageToFeed);
	socket.on('typing', setTypingIndicator);
});