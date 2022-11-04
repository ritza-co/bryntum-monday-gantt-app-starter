import { Gantt } from './node_modules/@bryntum/gantt/gantt.module.js';
import { getTasksFromMonday, addTaskToMonday, updateTaskOnMonday, addParentTaskToMonday, deleteTask } from './graph.js';

var isAppended = false;

getTasksFromMonday();


function createGantt(event_list) {

    var column_id_list = {child: event_list[0].children[0].column_values[2].id, parent: event_list[0].column_values[3].id};
    var parent_board_id = event_list[0].board_id;

    var gantt = new Gantt({
        // startDate is today and endDate is 1 year from today
        startDate: new Date(),
        endDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
    
        listeners : {
            dataChange: function (event) {
                updateMonday(event);
                }},
    
        project : {
            tasksData : event_list,
        },
    
        column_ids: column_id_list,
        board_id: parent_board_id, 
    
        columns : [
            { type : 'name', width : 160 }
        ]
    });

    if(isAppended == false){
        gantt.appendTo = document.body;
        isAppended = true;
    }
}

function updateParentList(results, event_list) {
    var parent_board = results.data.boards[1];
    for (var j = 0; j < parent_board.items.length; j++) {
        event_list.push({
            id: parent_board.items[j].id,
            monday_id       : parent_board.items[j].id,
            name     : parent_board.items[j].name,
            startDate : parent_board.items[j].column_values[3].text.slice(0,10),
            endDate : parent_board.items[j].column_values[3].text.slice(13,23),
            expanded : false,
            children : [],
            board_id: parent_board.id,
            column_values: parent_board.items[j].column_values,
        });
    }
    return event_list;
}

function updateChildrenList(results, event_list) {
    var child_board = results.data.boards[0];
    for (var j = 0; j < child_board.items.length; j++) {
        if(child_board.items[j].parent_item != null){
            var parent_id = child_board.items[j].parent_item.id;
            var child_id = child_board.items[j].id;
            for (var k = 0; k < event_list.length; k++) {
                if (parent_id == event_list[k].id ) {
                    event_list[k].children.push({
                        id : child_id,
                        monday_id : child_id,
                        name : child_board.items[j].name,
                        startDate : child_board.items[j].column_values[2].text.slice(0,10),
                        endDate : child_board.items[j].column_values[2].text.slice(13,23),
                        board_id: child_board.id,
                        column_values: child_board.items[j].column_values,
                        manuallyScheduled: true
                    });
                    event_list[k].expanded = true;
                    event_list[k].endDate = child_board.items[j].column_values[2].text.slice(13,23);
                }
            }
        }
    }
    return event_list;
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

export { createGantt, updateParentList, updateChildrenList };