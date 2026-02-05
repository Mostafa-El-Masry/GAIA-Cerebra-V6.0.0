# How Does the Web Work?

## Introduction

Before you can understand how to program the web, you need a more rigorous understanding of the web itself than you likely have now. These concepts provide a more holistic understanding of the ecosystem in which you will be working and will enable you to talk intelligently with other developers about your work.

## Lesson overview

This section contains a general overview of topics that you will learn in this lesson.

- Describe what the internet is.
- Describe what packets are and how they are used to transfer data.
- Understand the differences between a web page, web server, web browser and search engine.
- Briefly explain what a client is.
- Briefly explain what a server is.
- Explain what IP addresses are.
- Explain what DNS servers are.

## The internet

The **internet** is a global network of connected computers. Data is sent across the internet in small chunks called **packets**. Packets are routed from one machine to another until they reach their destination, where they are reassembled. This allows many users and applications to share the same network efficiently.

## Clients and servers

A **client** is a device or program that requests resources or services. When you open a website in your browser, your browser is the client.

A **server** is a computer or program that provides resources or services to clients. A **web server** is a server that stores and delivers web pages and related files (HTML, CSS, images, etc.) to clients over the internet.

So when you visit a website: your browser (the client) sends a request to the web server; the server responds with the files that make up the page; your browser then renders that content for you.

## Web page, web server, web browser, search engine

- A **web page** is a document (usually HTML) that you view in a browser. It can contain text, images, links, and more.
- A **web server** is the machine and software that hosts web pages and sends them to clients when requested.
- A **web browser** is the application on your computer (Chrome, Firefox, Safari, etc.) that requests web pages, receives the data, and displays it to you.
- A **search engine** is a service that indexes the web and lets you search for pages. It is not the same as the browser or the server; it helps you find which servers host which pages.

## IP addresses and DNS

Every device connected to the internet has an **IP address**—a numeric label that identifies it on the network. So that we don’t have to remember numbers like 93.184.216.34, we use domain names (e.g. example.com).

**DNS (Domain Name System)** is like a phone book for the internet. When you type a domain name into your browser, a **DNS server** is asked to translate that name into the correct IP address so your request can be routed to the right server. That process is often called a **DNS request**.

## Putting it together

When you type a URL into your browser and press Enter, your browser (client) uses DNS to find the server’s IP address, then sends a request to that server. The web server responds with the page and related files. Your browser receives these packets, reassembles them, and renders the web page. All of this happens over the internet using the same client–server and packet-based model you’ll build on as a developer.
