import { Gantt } from './node_modules/@bryntum/gantt/gantt.module.js';
import { getTasksFromMonday, addTaskToMonday, updateTaskOnMonday, addParentTaskToMonday, deleteTask } from './graph.js';

let isAppended = false;

getTasksFromMonday();

function createGantt(eventList) {
    let column_id_list_child;
    for (let i = 0; i < eventList.length; i++) {
        if (eventList[i]?.children.length > 0) {
          column_id_list_child = eventList[i].children[0].column_values[2].id;
          break;
        }
    }
    const column_id_list = {child: column_id_list_child, parent: eventList[0].column_values[3].id};
    const parent_board_id = eventList[0].board_id;

    const gantt = new Gantt({
        // startDate is today and endDate is 1 year from today
        startDate: new Date(),
        endDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
    
        listeners : {
            dataChange: function (event) {
                updateMonday(event);
            }
        },
    
        project : {
            tasksData : eventList,
        },
    
        column_ids: column_id_list,
        board_id: parent_board_id, 
    
        columns : [
            { type : 'name', width : 200 }
        ]
    });

    if(isAppended == false){
        gantt.appendTo = document.body;
        isAppended = true;
    }
}

function updateParentList(results, eventList) {
    let parent_board = results.data.boards[1];
    for (let j = 0; j < parent_board.items_page.items.length; j++) {
        eventList.push({
            id: parent_board.items_page.items[j].id,
            monday_id : parent_board.items_page.items[j].id,
            name     : parent_board.items_page.items[j].name,
            startDate : parent_board.items_page.items[j].column_values[3].text.slice(0,10),
            endDate : parent_board.items_page.items[j].column_values[3].text.slice(13,23),
            expanded : false,
            children : [],
            board_id: parent_board.id,
            column_values: parent_board.items_page.items[j].column_values,
            manuallyScheduled: true
        });
    }
    return eventList;
}

function updateChildrenList(results, eventList) {
    let child_board = results.data.boards[0];
    for (let j = 0; j < child_board.items_page.items.length; j++) {
        if(child_board.items_page.items[j].parent_item != null){
            const parent_id = child_board.items_page.items[j].parent_item.id;
            const child_id = child_board.items_page.items[j].id;
            for (let k = 0; k < eventList.length; k++) {
                if (parent_id == eventList[k].id ) {
                    eventList[k].children.push({
                        id : child_id,
                        monday_id : child_id,
                        name : child_board.items_page.items[j].name,
                        startDate : child_board.items_page.items[j].column_values[2].text.slice(0,10),
                        endDate : child_board.items_page.items[j].column_values[2].text.slice(13,23),
                        board_id: child_board.id,
                        column_values: child_board.items_page.items[j].column_values,
                        manuallyScheduled: true
                    });
                    eventList[k].expanded = true;
                    eventList[k].endDate = child_board.items_page.items[j].column_values[2].text.slice(13,23);
                }
            }
        }
    }
    return eventList;
}

function updateMonday(event) {
  if(event.action == "add" && event.isChild == true){
    // if the task is a child task
    if(event.records[0].data.parentId != null && !event.records[0].data.parentId.startsWith("_generatedProjectModel")){
            const parent_id = event.parent.data.monday_id;
            const child_name = event.records[0].data.name;
            const child_start = event.records[0].data.startDate.toISOString().split('T')[0];
            const child_end = event.records[0].data.endDate.toISOString().split('T')[0];
            addTaskToMonday(event, parent_id, child_name, child_start, child_end);
        // if the task is a parent task
        } else {
            const parent_id = event.records[0].data.id;
            const parent_name = event.records[0].data.name;
            const parent_start = event.records[0].data.startDate.toISOString().split('T')[0];
            const parent_end = event.records[0].data.endDate.toISOString().split('T')[0];
            addParentTaskToMonday(event, parent_name, parent_start, parent_end);
        }
    } else if (event.action == "update"){
        if("startDate" in event.changes || "endDate" in event.changes || "name" in event.changes){
            if ("column_values" in event.records[0].data){
                if ("name" in event.changes){
                    var updateType = "name";
                } else if ("startDate" in event.changes || "endDate" in event.changes){
                    var updateType = "timeline";
                }
                const task_id = event.record.data.monday_id;
                const task_name = event.record.data.name;
                const task_start = event.record.data.startDate.toISOString().split('T')[0];
                const task_end = event.record.data.endDate.toISOString().split('T')[0];
                const board_id = event.record.data.board_id;
                const column_id = event.record.data.column_values[event.record.data.column_values.length - 1].id;
                updateTaskOnMonday(board_id, column_id, task_id, task_name, task_start, task_end, updateType);
            }
        }
    } else if (event.action == "remove"){
        if(event.isCollapse != true){
            const task_id = event.records[0].data.monday_id;
            deleteTask(task_id);
        }
    }
}

export { createGantt, updateParentList, updateChildrenList };