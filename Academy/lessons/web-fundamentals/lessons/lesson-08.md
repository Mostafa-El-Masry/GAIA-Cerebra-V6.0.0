# Command Line Basics

## Introduction

That blank screen or window with a prompt and blinking cursor is the **command line interface (CLI)**, where you can enter commands that your computer will run for you. Working with the command line is a critical skill for you to learn as a developer. The command line is like a base of operations, from which you can launch other programs and interact with them. It has a syntax of its own to learn, but since you'll be entering the same commands often, you'll quickly pick up the commands you need most.

In this introductory lesson on the command line, you'll learn how to navigate your computer and manipulate files and directories (folders) directly from the command line.

## Lesson overview

- Describe what the command line is.
- Open the command line on your computer.
- Use the command line to navigate directories and display directory contents.
- Use the command line to create a new directory and a new file.
- Use the command line to rename or remove a directory and a file.
- Use the command line to open a file or folder in a program.

## Opening the terminal

- **Linux:** Open the programs menu and search for "Terminal". You can also press Ctrl+Alt+T.
- **macOS:** Open Applications > Utilities and find "Terminal". Or use Spotlight (Cmd+Space) and search for "Terminal".

The window will be mostly blank, with a line ending in a symbol such as `$` or `%`. This symbol—the **prompt**—indicates that the terminal is waiting for you to enter a command. Type `whoami` and press Enter; it returns your username.

In guides, commands are often shown with the prompt first, e.g. `$ whoami`. Type only the command, not the prompt.

## Why learn this now?

You will use the command line heavily throughout the curriculum. You will install software from the command line and use Git primarily in the command line. In your career as a developer, you may use the command line daily. It is an indispensable skill.

## Typing passwords in the terminal

When a command asks for your password (e.g. for authentication), the characters will not appear as you type. This is a security feature. The terminal is still accepting your input; type your password as normal and press Enter.

## Using the command line effectively

Programmers tend to automate repetitive tasks. You can take advantage of shortcuts and habits that make the command line faster to use.

**Copy and paste:** In the terminal, use Ctrl+Shift+C (Mac: Cmd+C) to copy and Ctrl+Shift+V (Mac: Cmd+V) to paste. This is especially useful when copying commands from your browser into the terminal.

**Tab completion:** By pressing Tab, the command line can automatically complete commands and paths when there is only one possible match. For example, if you type `cd D` and press Tab, you might see `Documents/` and `Downloads/`. Type a bit more (e.g. `cd Doc`) and press Tab again to complete `Documents/`. Tab completion saves time and reduces typos.

**Opening a project in your editor:** Once your editor is installed, you can open a project from the command line. For example, from the project directory you can run `code .` to open the current folder in VS Code. The `.` means "current directory" and is used in many commands (e.g. later you will see `git add .` to add all files in the current directory).

## Essential commands

- **Navigate:** `cd` (change directory). `cd folderName` goes into that folder. `cd ..` goes up one level. `cd` on its own (or `cd ~`) takes you to your home directory.
- **Where am I?** `pwd` prints the full path of the directory you are currently in.
- **List contents:** `ls` displays the contents of the current directory.
- **Create directory:** `mkdir folderName` creates a new directory.
- **Create file:** `touch fileName` creates a new empty file.
- **Remove file or directory:** `rm fileName` removes a file. `rm -r folderName` removes a directory and its contents. Use with care.
- **Rename or move:** `mv oldName newName` renames a file or directory, or moves it to another path.

## Practice

Create a new directory (e.g. `test`), navigate into it, create a file (e.g. `test.txt` with `touch`), open it in your editor and make a change, then navigate back out and remove the directory. Repeating these actions will make the commands second nature. Moving and copying files is often more efficient from the command line than from the graphical file manager, even if it feels unfamiliar at first.
