import { createGantt } from "./main.js";

function getTasksFromMonday() {
  let query = '{boards(limit:2) { name id description items { name id parent_item{id} column_values{ title id type text } } } }';
  var response = fetch ("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : '<your-access-token>'
    },
    body: JSON.stringify({
      'query' : query
    })
  })
    .then(result => {
      let res = result.json();
      return res;
  })
    .then(res => {
      createGantt(res); 
    });  
}

function addParentTaskToMonday(event, parent_name, parent_start, parent_end) {
  
    // add a parent task to monday.com with the given parameters
    var column_values = `{\"${event.source.column_ids.parent}\" : {\"from\" : \"${parent_start}\", \"to\": \"${parent_end}\"}}`;
    column_values = JSON.stringify(column_values);
  
    let query = `mutation{ create_item (board_id: ${event.source.board_id}, item_name: \"${parent_name}\", create_labels_if_missing: true, column_values: ${column_values}){ id board{id} column_values{title id type text } }}`;
  
    var response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : '<your-access-token>'
      },
      body: JSON.stringify({
        'query' : query
      })
    })
    .then(result => {
    let res = result.json();
    return res;
    })
    .then(res => {  
    console.log(res);
    event.records[0]._data.monday_id = res.data.create_item.id;
    event.records[0]._data.board_id = res.data.create_item.board.id;
    event.records[0]._data.column_values = res.data.create_item.column_values;
    event.records[0]._data.manuallyScheduled = true;
    })
}

function addTaskToMonday(event, parent_id, child_name, child_start, child_end) {

    // add a task to monday.com with the given parameters
    var column_values = `{\"${event.source.column_ids.child}\" : {\"from\" : \"${child_start}\", \"to\": \"${child_end}\"}}`;
    column_values = JSON.stringify(column_values);
    
    let query = `mutation{ create_subitem (parent_item_id: ${parent_id}, item_name: \"${child_name}\", create_labels_if_missing: true, column_values: ${column_values}){ id board{id} parent_item{id} column_values{title id type text } }}`;
    
    var response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : '<your-access-token>'
      },
      body: JSON.stringify({
        'query' : query
      })
    })
    .then(result => {
    let res = result.json();
    return res;
    })
    .then(res => {
    event.records[0]._data.monday_id = res.data.create_subitem.id;
    event.records[0]._data.board_id = res.data.create_subitem.board.id;
    event.records[0]._data.parentId = res.data.create_subitem.parent_item.id;
    event.records[0]._data.column_values = res.data.create_subitem.column_values;
    event.records[0]._data.manuallyScheduled = true; 
    }
    );
}

function updateTaskOnMonday(board_id, column_id, child_id, child_name, child_start, child_end, updateType) {

    if(updateType == "timeline") {
      var column_values = `{\"${column_id}\" : {\"from\" : \"${child_start}\", \"to\" : \"${child_end}\"}}`
    } else if (updateType == "name") {
      var column_values = `{\"name\" : \"${child_name}\"}`
    }
    column_values = JSON.stringify(column_values);
    
    let query = `mutation{ change_multiple_column_values (board_id: ${board_id}, item_id: ${child_id}, column_values: ${column_values}){ id }}`;
    
    var response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : '<your-access-token>'
      },
      body: JSON.stringify({
        'query' : query
      })
    })
    .then(result => {
      let res = result.json();
      return res;
    })
    .then(res => {
      console.log(res);
    })
  }

  function deleteTask(id) {
  
    // delete a task on monday.com with the given parameters
    let query = `mutation{ delete_item (item_id: ${id}){ id }}`;
    
    var response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : '<your-access-token>'
      },
      body: JSON.stringify({
        'query' : query
      })
    })
  }

  export { getTasksFromMonday, addTaskToMonday, addParentTaskToMonday, updateTaskOnMonday, deleteTask };