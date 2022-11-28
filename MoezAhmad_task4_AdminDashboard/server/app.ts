import express from "express";
import { Student, List, Task } from "./db/types";
import bodyParser from "body-parser";
import { mongoose } from "./db/mongoose";

const app = express();

// Load middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

/*
 * GET /lists
 * Purpose: Get all lists
 */
app.get("/lists", async (req, res) => {
  List.find().then((lists) => {
    res.send(lists);
  });
});

/*
 * POST /lists
 * Purpose: Create a list
 */
app.post("/lists", (req, res) => {
  // We will create a student here
  let { title } = req.body;
  console.log({ title });
  let newList = new List({
    title,
  });
  newList
    .save()
    .then((listDoc) => {
      // the full list document is returned (incl. id)
      res.send(listDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * PATCH /lists:id
 * Purpose: Update a list
 */
app.patch("/lists/:id", (req, res) => {
  List.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * DELETE /lists:id
 * Purpose: Delete a student
 */
app.delete("/lists/:id", (req, res) => {
  List.findOneAndDelete({ _id: req.params.id })
    .then((deletedListDoc) => {
      res.send(deletedListDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks of a list
 */
app.get("/lists/:listId/tasks", (req, res) => {
  Task.find({
    _listId: req.params.listId,
  })
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * POST /lists/:listId/tasks
 * Purpose: Create a task in a list
 */
app.post("/lists/:listId/tasks", (req, res) => {
  // We will create a task here
  let { title } = req.body;
  let newTask = new Task({
    title,
    _listId: req.params.listId,
  });
  newTask
    .save()
    .then((newTaskDoc) => {
      res.send(newTaskDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: update a task in a list
 */
app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
    },
    {
      $set: req.body,
    }
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});
/*
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: delete a task in a list
 */
app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndDelete({
    _id: req.params.taskId,
  })
    .then((deletedTaskDoc) => {
      res.send(deletedTaskDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  mongoose;
});
