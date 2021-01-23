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

    // check if app is online, if yes, run uploadTransactions  function to send all local db data to api
    if (nagivator.onLine) {
        //we haven't created this yet, but we will soon, so let's comment this out for now
        //uploadTransactions();
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
    const actionObjectStore = transaction.ObjectStore('new_action');

    // add record to your store with add method
    actionObjectStore.add(record);
}