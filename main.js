import { Gantt } from './node_modules/@bryntum/gantt/gantt.module.js';
import { getTasksFromMonday, addTaskToMonday, updateTaskOnMonday, addParentTaskToMonday, deleteTask } from './graph.js';

getTasksFromMonday();


function createGantt(tasks) {

    var event_list = [];
    var column_id_list = {child: tasks.data.boards[0].items[0].column_values[2].id, parent: tasks.data.boards[1].items[0].column_values[3].id};

    // loop through the parent items
    for (var j = 0; j < tasks.data.boards[1].items.length; j++) {
        event_list.push({
            id: tasks.data.boards[1].items[j].id,
            monday_id       : tasks.data.boards[1].items[j].id,
            name     : tasks.data.boards[1].items[j].name,
            startDate : tasks.data.boards[1].items[j].column_values[3].text.slice(0,10),
            endDate : tasks.data.boards[1].items[j].column_values[3].text.slice(13,23),
            expanded : false,
            children : [],
            board_id: tasks.data.boards[1].id,
            column_values: tasks.data.boards[1].items[j].column_values,
        });
    }

    // loop through the subitems
    for (var j = 0; j < tasks.data.boards[0].items.length; j++) {
        if(tasks.data.boards[0].items[j].parent_item != null){

            // get the parent id
            var parent_id = tasks.data.boards[0].items[j].parent_item.id;
            // get the child id
            var child_id = tasks.data.boards[0].items[j].id;
            // loop through the event list
            for (var k = 0; k < event_list.length; k++) {

                // if the parent id matches the event id
                if (parent_id == event_list[k].id ) {

                    // add the child to the parent
                    event_list[k].children.push({
                        id : child_id,
                        monday_id : child_id,
                        name : tasks.data.boards[0].items[j].name,
                        startDate : tasks.data.boards[0].items[j].column_values[2].text.slice(0,10),
                        endDate : tasks.data.boards[0].items[j].column_values[2].text.slice(13,23),
                        board_id: tasks.data.boards[0].id,
                        column_values: tasks.data.boards[0].items[j].column_values,
                        manuallyScheduled: true
                    });
                    event_list[k].expanded = true;
                    event_list[k].endDate = tasks.data.boards[0].items[j].column_values[2].text.slice(13,23);
                }
            }
        }
    }

    var gantt = new Gantt({
        appendTo : document.body,
    
        startDate : new Date(2022, 10, 1),
        endDate   : new Date(2023, 10, 20),
    
        listeners : {
            dataChange: function (event) {
                updateMonday(event);
                }},
    
        project : {
            tasksData : event_list,
        },
    
        column_ids: column_id_list,
        board_id: tasks.data.boards[1].id, 
    
        columns : [
            { type : 'name', width : 160 }
        ]
    });
}

function updateMonday(event) {
    if(event.action == "add" && event.isChild == true){
        if(event.records[0]._data.parentId != null){
            var parent_id = event.parent._data.monday_id;
            var child_name = event.records[0]._data.name;
            var child_start = event.records[0]._data.startDate.toISOString().split('T')[0];
            var child_end = event.records[0]._data.endDate.toISOString().split('T')[0];
            addTaskToMonday(event, parent_id, child_name, child_start, child_end);
        } else {
            var parent_id = event.records[0]._data.id;
            var parent_name = event.records[0]._data.name;
            var parent_start = event.records[0]._data.startDate.toISOString().split('T')[0];
            var parent_end = event.records[0]._data.endDate.toISOString().split('T')[0];
            addParentTaskToMonday(event, parent_name, parent_start, parent_end);
        }
    } else if (event.action == "update"){
        if("startDate" in event.changes || "endDate" in event.changes || "name" in event.changes){
            if ("column_values" in event.records[0]._data){
                if ("name" in event.changes){
                    var updateType = "name";
                } else if ("startDate" in event.changes || "endDate" in event.changes){
                    var updateType = "timeline";
                }
                var task_id = event.record._data.monday_id;
                var task_name = event.record._data.name;
                var task_start = event.record._data.startDate.toISOString().split('T')[0];
                var task_end = event.record._data.endDate.toISOString().split('T')[0];
                var board_id = event.record._data.board_id;
                var column_id = event.record._data.column_values[event.record._data.column_values.length - 1].id;
                updateTaskOnMonday(board_id, column_id, task_id, task_name, task_start, task_end, updateType);
            }
        }
    } else if (event.action == "remove"){
        if(event.isCollapse != true){
            var task_id = event.records[0]._data.monday_id;
            deleteTask(task_id);
        }
    }
}

export { createGantt };