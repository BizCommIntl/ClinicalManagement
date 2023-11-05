import mongoose from "mongoose";
//import  {schema,model}   from "mongoose";

mongoose.pluralize(null)
const schema = mongoose.Schema;

const schemaItems = new schema({
    ID: { type: String },
    Title: { type: String },
    Status: { type: String },
})

const TasksTable = mongoose.model('TasksTable', schemaItems, 'TasksTable');
export default TasksTable;
