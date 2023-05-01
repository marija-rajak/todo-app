const moon = document.getElementById('themeIcon');
const todos = document.querySelectorAll('#todo_list li');
const list = document.getElementById('todo_list');
var itemToMove = null;

moon.addEventListener('click', function () { document.body.classList.toggle('dark'); })

//drag and drop funcionality
todos.forEach((todo, index) => {
	todo.addEventListener('dragstart', () => {
		/* todo.classList.add('detached');
		itemToMove = document.querySelector('.detached'); */

		//Set dragged element as Item to move
		itemToMove = todo;
		setTimeout(() => itemToMove.style.display = 'none', 0);
	});

	todo.addEventListener('dragend', () => {
		itemToMove.style.display = 'flex';
		itemToMove = null;
	})

	todo.addEventListener('dragover', (event) => {

		//Set adding-related classes to the element that is dragged over by moving element
		todo.classList.add('target');

		if (event.offsetY <= todo.getBoundingClientRect().height / 2) {
			todo.classList.add('insertAbove');
			todo.classList.remove('insertBelow');
		} else {
			todo.classList.add('insertBelow');
			todo.classList.remove('insertAbove');
		}

		//Remove adding-related classes from all other elements

		for (let i = 0; i < todos.length; i++) {
			if (i === index) {
				continue;
			} else {
				todos[i].classList.remove('target', 'insertAbove', 'insertBelow');
			}
		}
	});
});

list.addEventListener('dragover', (event) => {
	event.preventDefault();
});

list.addEventListener('drop', () => {
	const anchorElement = document.querySelector('.target');
	if (anchorElement.classList.contains('insertAbove')) {
		anchorElement.insertAdjacentElement('beforebegin', itemToMove);
	} else {
		anchorElement.insertAdjacentElement('afterend', itemToMove);
	}

	anchorElement.classList.remove('target', 'insertAbove', 'insertBelow');
});
