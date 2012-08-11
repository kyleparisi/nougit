Nougit
======

Nougit is **a tasty git client** that runs in your web browser! Who says **sweet** can't be low-calorie? Weighing in at a mere *5mb* uncompressed, it is a lean solution for managing your Git repositories both locally and remotely.

## Prerequistites

* Node.js 0.8.x (http://nodejs.org)
* Git 1.7.x.x (http://git-scm.com)

> Be sure that you have configured your global git user name and email, otherwise the setup will fail. See http://git-scm.com/book/en/Customizing-Git-Git-Configuration for more information.

You can install the latest stable release via Node Package Manager:

```shell
$ npm install nougit
```

Or you can live on the edge and install the latest and greatest with Git:

```shell
$ git clone https://github.com/gordonwritescode/nougit.git
```

Since Nougit fills two different roles (acting as a local client or a remote server), it is important to know which role you need it to fill.

So, where is your Nougit installation going to live?

## Workstation

As a workstation client, Nougit manages your repositories by default in your home directory under `./nougitrepos`. This is configurable by cracking open `config.json` after running Nougit for the first time. When you are ready to get started, navigate to the directory in your terminal where you have installed Nougit and run:

```shell
node nougit/app.js
```

Nougit will do some quick configuration and setup and when it is finished it will listen on port `8080`.

## Server

As a server, Nougit manages your repositories internally, inside `./public/repositories`. This allows workstations to clone/push/pull the repos over HTTP without requiring additional authentication. **This is not secure if your server is public.** Nougit is intended for internal networks - not public websites.

> Note that when installing with Git, you **must** remove the `.git` directory if you intend on running Nougit as a server. This is because Nougit manages your repositories internally in this mode.

To run Nougit in server mode:

```shell
$ node nougit/app.js server
```

## Contribute

Nougit was written to be a specific solution by one developer for him and his team. Want to make it right for you and your team? Please do! Pull requests are always welcome!

## Author

Nougit 0.5 by Gordon Hall (gordon@gordonwritescode.com)  
Released under MIT license.