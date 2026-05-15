AI Reflection — AutoPulse Capstone Project
Student: Jeancarlo Ricardo
Program: Web Development — triOS College
Project: AutoPulse — Smart Vehicle Management Platform

How I Used AI During This Project
Throughout the development of AutoPulse, I used AI tools — primarily Claude (Anthropic) — as a coding assistant and learning partner. This reflection describes how AI helped me, what I learned from the experience, and how I maintained ownership of my project.

What I Used AI For
1. Learning New Concepts
Before this project, I had never built a backend with PHP or connected a web app to a MySQL database. I used Claude to explain concepts step by step — not just giving me code, but explaining why each piece worked. For example, when setting up PDO connections and prepared statements, I asked Claude to explain each line before moving on. This helped me understand SQL injection prevention and secure database practices rather than just copying code blindly.
2. Debugging and Problem Solving
Many of the most valuable interactions with AI were during debugging sessions. When I encountered errors — like the vehicle_id mismatch between my local and Railway databases, or the Service Worker caching old CSS — Claude helped me read error messages and trace the root cause. Over time, I started recognizing patterns and solving some bugs on my own before asking for help.
3. Architecture and Planning
Before writing a single line of code, I used AI to help me design the database schema. We discussed what tables I needed, what relationships existed between them (foreign keys, cascades), and what data types made sense. This planning phase was critical — a well-designed database saved me from major refactoring later.
4. API Integration
Integrating three external APIs (NHTSA for VIN lookup, Open-Meteo for weather, and Anthropic's Claude API for the AI Scanner) required understanding how to make HTTP requests, handle JSON responses, and deal with authentication. Claude helped me understand the structure of each API's response and how to extract only the data I needed.
5. Deployment
Setting up Railway, configuring environment variables, writing a Dockerfile, and connecting GitHub for automatic deployments was completely new territory for me. AI guidance helped me understand the difference between local development and production environments, and why sensitive information like API keys should never be committed to a public repository.

What I Did Myself
While AI was a valuable tool, the project remained mine throughout. I:

Made all architectural and feature decisions
Decided what the app would do, who it was for, and what problems it would solve
Caught errors in AI-generated code (and there were several — mismatched variable names, broken function closures, code placed outside the correct scope)
Questioned AI suggestions that didn't make sense for my context (for example, reconsidering the winter tire alert logic, which I realized was not appropriate for Canadian driving patterns)
Tested every feature manually and verified it worked in both local and production environments
Pushed back when something felt wrong and asked for a better approach

One of my most important realizations was that AI can generate code quickly, but it doesn't always understand the full context of your project. There were multiple times where I had to say "that's not right for my situation" and redirect the conversation.

What I Learned About Working With AI
AI is a Tool, Not a Replacement
The biggest lesson I took from this project is that AI is most useful when you already understand what you're trying to build. When I had no idea what I was doing, AI suggestions were hard to evaluate. As my understanding grew, I became better at using AI effectively — asking more specific questions, catching mistakes faster, and knowing when to push back.
Prompting Matters
The quality of AI responses depends heavily on how you ask. Vague questions give vague answers. When I learned to provide context — "I'm building a PHP app with MySQL on XAMPP, here's my current code, here's the error I'm getting" — the responses became much more useful.
AI Makes Mistakes
AI-generated code is not always correct. During this project, Claude gave me code with syntax errors, logic bugs, and solutions that worked in theory but not in my specific setup. Learning to read error messages and debug AI-generated code was one of the most valuable skills I developed.
Critical Thinking Is Non-Negotiable
The winter mode feature is a good example of this. The initial AI suggestion was to alert users about winter tires based purely on temperature — but I knew from living in Canada that people switch tires seasonally, not based on a single cold day. I pushed back and redesigned the feature to provide contextually relevant alerts (battery, tire pressure, washer fluid, ice warnings) instead. That decision made the feature genuinely useful rather than just technically functional.

Reflection on AI in Education
Using AI as a learning tool is different from using it to cheat. The difference is engagement — did I understand what was built, or did I just run it and move on?
For AutoPulse, I can explain every file, every function, and every API call. I know why the database uses foreign keys with CASCADE. I know why passwords are hashed with password_hash(). I know what a Service Worker does and why it was causing caching issues. I know this because I engaged with the explanations, asked follow-up questions, and tested everything myself.
AI helped me build something I could not have built alone in this timeframe — but more importantly, it helped me understand how to build it. That knowledge stays with me beyond this project.

Tools Used
ToolPurposeClaude (Anthropic)Primary coding assistant and learning partnerClaude Haiku APIPowers the AI Dashboard Scanner featureGitHub CopilotOccasional autocomplete (used cautiously)

AutoPulse was built as a Capstone Project for the Web Development Diploma program at triOS College, Cambridge/Waterloo, Ontario.