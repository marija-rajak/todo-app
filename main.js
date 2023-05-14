const themeIcon = document.getElementById('themeIcon'); //theme changing icon
let todos; //collection of todo list elements
let selectedTodos; //collection of selected (completed/active) todos
let list = document.getElementById('todo_list'); //todo list

let itemToMove = null; //dragged list item

const taskInput = document.getElementById('task-input');
const completeCheck = document.getElementById('complete-check');
const addTaskBtn = document.getElementById('add-task');

const leftTasksNumber = list.lastElementChild.firstElementChild;
const completedFilterBtn = document.getElementById('completedFilterBtn');
const activeFilterBtn = document.getElementById('activeFilterBtn');
const allBtn = document.getElementById('allBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

//Get items from local storage on application start
window.onload = () => {
	let savedData = JSON.parse(localStorage.getItem('tasks'));
	if (savedData) {
		savedData.forEach(savedItem => {
			const taskToWrite = createTask(savedItem);
			list.insertBefore(taskToWrite, list.children[list.children.length - 1]);
		})
	}

	setTimeout(function () {
		todos = document.getElementsByClassName('entry');

		for (item of todos) {
			addListeners(item);
		}
		countTodosLeft();
	}, 0);
}

//Set drag and drop funcionality-event listeners on list items, allowing to rearange list order
addListeners = (todo) => {

	todo.addEventListener('dragstart', () => {

		//Set dragged element as Item to move
		itemToMove = todo;

		//Hide item while moving
		setTimeout(() => itemToMove.style.display = 'none', 0);
	});

	todo.addEventListener('dragend', () => {

		//Show moved item, after moving ended
		todo.style.display = 'flex';

		//Cancel Item to move
		itemToMove = null;
	});

	todo.addEventListener('dragover', (event) => {

		//Set class to mark dragged over element as target element
		todo.classList.add('target');

		//Depending on position of dragged element related do dragged over element,
		//add class that determines place for dropping
		if (event.offsetY <= todo.getBoundingClientRect().height / 2) {
			todo.classList.add('insertAbove');
			todo.classList.remove('insertBelow');
		} else {
			todo.classList.add('insertBelow');
			todo.classList.remove('insertAbove');
		}

		//Remove adding-related classes from all other elements, but the element that is dragged over
		for (item of todos) {
			if (todo === item) {
				continue;
			} else {
				item.classList.remove('target', 'insertAbove', 'insertBelow');
			}
		}
	});

	//Add event listener to delete button-remove list item (todo) and update local storage
	todo.lastElementChild.addEventListener('click', () => {
		todo.remove();
		update();
		countTodosLeft();
	});

	//Add event listener to checkbox-mark task as completed and update local storage
	todo.firstElementChild.children['completed'].addEventListener('change', () => {
		todo.children[1].classList.toggle('done');
		update();
		countTodosLeft();
	});
}

//get todo from user input, create new todo element and add to list and save to local storage
addNewTodo = () => {

	//Get values of new entry from input
	let newTodo = {
		completed: completeCheck.checked,
		task: taskInput.value
	}

	//Reset input after data take-over
	formReset();

	//Create new li element with data from input and add event listeners
	const taskToWrite = createTask(newTodo);
	addListeners(taskToWrite);

	//Add new li to teh top of existing todos
	list.insertBefore(taskToWrite, list.children[0]);

	//Send new todos to local storage
	update();
	countTodosLeft();
}

//Refresh todo list and update local storage
update = () => {

	//Create temp array for storing todos
	let tasks = [];

	//Read todos from HTML (list items)
	for (item of todos) {
		tasks.push({ task: item.querySelector('p').innerText, completed: item.querySelector('input').checked });
	};

	//Write to local storage
	localStorage.setItem('tasks', JSON.stringify(tasks));
}

//Control add button appearance, depending on input-showw button if input is not empty
taskInput.addEventListener('input', () => {
	if (this.value !== '') {
		addTaskBtn.style.display = 'block';
	}
});

//Reset new todo input field
formReset = () => {
	taskInput.value = "";
	addTaskBtn.style.display = 'none';
	completeCheck.checked = false;
}

//write HTML for tasks
createTask = (data) => {
	let newTask = document.createElement('li');
	newTask.setAttribute('draggable', 'true');
	newTask.classList.add('entry');

	let completeIndicator = document.createElement('div');
	completeIndicator.classList.add('checkMark');

	let indicatorFrame = document.createElement('span');
	indicatorFrame.classList.add('frame');

	let completed = document.createElement('input');
	completed.setAttribute('type', 'checkbox');
	completed.setAttribute('name', 'completed');
	if (data.completed) {
		completed.setAttribute('checked', 'true');
	}

	let checkIcon = document.createElement('span');
	checkIcon.classList.add('material-icons-round', 'check-mark');
	checkIcon.innerText = "done";

	completeIndicator.appendChild(indicatorFrame);
	completeIndicator.appendChild(completed);
	completeIndicator.appendChild(checkIcon);

	let task = document.createElement('p');
	task.innerText = data.task;
	if (data.completed) {
		task.classList.add('done');
	}

	let closeBtn = document.createElement('span');
	closeBtn.classList.add('material-symbols-rounded', 'action');
	closeBtn.innerText = 'close';

	newTask.appendChild(completeIndicator);
	newTask.appendChild(task);
	newTask.appendChild(closeBtn);

	return newTask;
}

//Allow dropping to another place in list
list.addEventListener('dragover', (event) => {
	event.preventDefault();
});

//Finish drag and drop-determine dropping place (abowe/below target element),
//drop itemToMove on target, refresh list and local storage
list.addEventListener('drop', () => {

	//Get target element to drop dragged element
	const anchorElement = document.querySelector('.target');

	//Determine place to drop dragged element depending on position related classes
	if (anchorElement.classList.contains('insertAbove')) {
		anchorElement.insertAdjacentElement('beforebegin', itemToMove);

	} else {
		anchorElement.insertAdjacentElement('afterend', itemToMove);
	}

	//Remove drop determing classes from target elemen
	anchorElement.classList.remove('target', 'insertAbove', 'insertBelow');

	//Send new order of todos to local storage
	update();

	//Apply styles for the first element in list, after dragging item in selected cathegory
	if (selectedTodos) {
		styleFirst();
	}
});

//Set functionality to add button
addTaskBtn.addEventListener('click', addNewTodo);

//Count remaining todos
countTodosLeft = () => {
	let counter = todos.length - list.querySelectorAll('.done').length;
	if (counter === 1) {
		leftTasksNumber.innerText = counter + " item left";
	} else {
		leftTasksNumber.innerText = counter + " items left";
	}
}

//Filter todos in desired cathegory
let selectTodos = (query) => {
	selectedTodos = null;
	for (item of list.children) {

		if (item.querySelector(query)) {
			item.style.display = 'flex';
			item.classList.add('selected');
		} else {
			item.style.display = 'none';
			item.classList.remove('selected');
		}
	}
	list.lastElementChild.style.display = 'flex';

	selectedTodos = list.getElementsByClassName('selected');
	styleFirst();
}

//
styleFirst = () => {
	for (item of selectedTodos) {
		if (item == selectedTodos[0]) {
			item.classList.add('firstOf');
		} else {
			item.classList.remove('firstOf');
		}
	}
}

//Filter completed
completedFilterBtn.addEventListener('click', () => selectTodos('.done'));

//Filter active
activeFilterBtn.addEventListener('click', () => selectTodos('p:not(.done)'));

//Show all
allBtn.addEventListener('click', () => {
	list.querySelectorAll('li').forEach(item => {
		item.style.display = 'flex';
		item.classList.remove('selected');
	});
});

//Remove completed tasks from list and update local storage
clearCompletedBtn.addEventListener('click', () => {
	for (item of todos) {
		if (item.querySelector('input').checked) {
			item.remove();
		}
	}

	update();
});


themeIcon.addEventListener('click', function () {
	document.querySelectorAll('*').forEach(element => element.classList.toggle('dark-mode'));
	if (themeIcon.classList.contains('dark-mode')) {
		themeIcon.src = 'images/icon-sun.svg';
		themeIcon.alt = 'light theme icon';
	} else {
		themeIcon.src = 'images/icon-moon.svg';
		themeIcon.alt = 'dark theme icon';
	}
})
