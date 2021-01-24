const { ServerResponse } = require("http");

// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'dbTransaction' and set it to version 1
const request = indexedDB.open('dbTransaction', 1);

// this event will emit if the database version changes (nonexistan to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
// create an object store (table) called 'new_action', set it to have an auto-incrementing primary key
db.createObjectStore('new_action', {autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    //when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes, run uploadActions  function to send all local db data to api
    if (navigator.onLine) {
        uploadActions();
    }
};

request.onerror = function(event) {
    // log error here 
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    //open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_action'], 'readwrite');

    // access the object store for `new_transaction`
    const actionObjectStore = transaction.objectStore('new_action');

    // add record to your store with add method
    actionObjectStore.add(record);
};

function uploadActions() {
    // open a transaction on your db
    const transaction = db.transaction(['new_action'], 'readwrite');

    // access your object score
    const actionObjectStore = transaction.objectStore('new_action');

    //get all records from store and set to a variable
    const getAll = actionObjectStore.getAll();

    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDB's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(ServerResponse => {
                if (ServerResponse.message) {
                    throw new Error(ServerResponse);
                }
                //open one more transaction
                const transaction = db.transaction(['new_action'], 'readwrite');
                //access the new_action object store
                const actionObjectStore = transaction.objectStore('new_action');
                // clear all items in your store
                actionObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadActions);