import { createGantt, updateChildrenList, updateParentList, accessToken } from "./main.js";

function getTasksFromMonday() {
  const query = `{
      boards(limit: 2) {
      id
      items_page {
        items {
          id
          name
          parent_item{id}
          column_values {
            id
            text
            value
            column {
              title
              settings_str
            }
          }
        }
      }
    }
  }`;

  const response = fetch ("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : accessToken,
      'API-Version' : '2024-10'
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
      let eventList = [];
      eventList = updateParentList(res, eventList);
      eventList = updateChildrenList(res, eventList);
      createGantt(eventList); 
    });  
}

function addParentTaskToMonday(event, parent_name, parent_start, parent_end) {
    // add a parent task to monday.com with the given parameters
    let column_values = `{\"${event.source.column_ids.parent}\" : {\"from\" : \"${parent_start}\", \"to\": \"${parent_end}\"}}`;
    column_values = JSON.stringify(column_values);
  
    let query = `mutation{ create_item (board_id: ${event.source.board_id}, item_name: \"${parent_name}\", create_labels_if_missing: true, column_values: ${column_values}){ id board{id} column_values{id type text } }}`;
  
    const response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : accessToken,
        'API-Version' : '2024-10'
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
      event.records[0].data.monday_id = res.data.create_item.id;
      event.records[0].data.board_id = res.data.create_item.board.id;
      event.records[0].data.column_values = res.data.create_item.column_values;
      event.records[0].data.manuallyScheduled = true;
    })
}

function addTaskToMonday(event, parent_id, child_name, child_start, child_end) {

    console.log('event.source.column_ids: ', event.source.column_ids)
    // add a task to monday.com with the given parameters
    let column_values = `{\"${event.source.column_ids.child}\" : {\"from\" : \"${child_start}\", \"to\": \"${child_end}\"}}`;
    column_values = JSON.stringify(column_values);
    
    let query = `mutation{ create_subitem (parent_item_id: ${parent_id}, item_name: \"${child_name}\", create_labels_if_missing: true, column_values: ${column_values}){ id board{id} parent_item{id} column_values{ id type text } }}`;
    
    const response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : accessToken,
        'API-Version' : '2024-10'
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
      event.records[0].data.monday_id = res.data.create_subitem.id;
      event.records[0].data.board_id = res.data.create_subitem.board.id;
      event.records[0].data.parentId = res.data.create_subitem.parent_item.id;
      event.records[0].data.column_values = res.data.create_subitem.column_values;
      event.records[0].data.manuallyScheduled = true; 
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
    
    const response = fetch ("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : accessToken,
        'API-Version' : '2024-10'
      },
      body: JSON.stringify({
        'query' : query
      })
    })
    .then(result => {
      let res = result.json();
      return res;
    })
}

function deleteTask(id) {

  // delete a task on monday.com with the given parameters
  let query = `mutation{ delete_item (item_id: ${id}){ id }}`;
  
  const response = fetch ("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : accessToken,
      'API-Version' : '2024-10'
    },
    body: JSON.stringify({
      'query' : query
    })
  })
}

export { getTasksFromMonday, addTaskToMonday, addParentTaskToMonday, updateTaskOnMonday, deleteTask };