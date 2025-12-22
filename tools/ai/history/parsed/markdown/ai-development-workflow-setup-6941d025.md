# AI development workflow setup

**Created:** 2025-12-16T21:33:26.395Z
**Updated:** 2025-12-18T01:49:26.775Z
**Messages:** 2

---

### 👤 USER (2025-12-16T21:33:25.177Z)

Please expand/engineer this prompt for ChatGPT so it is crystal clear and provides an output that is easy for me to understand and implement:

I'm working with Claude AI developing an app called The Story Portal. Currently we are working in a single .html file where Claude outputs the code, I copy it, paste it into my locally saved .html file in my Brackets editor, save the file, then refresh my browser to see the changes. The .html file is getting very large with 6,283 lines of code. This process is very clunky and the length of the file is preventing me from working on it with Claude due to chat length limitations.

I am now wanting to setup a streamlined development environment with Claude where the file is broken into separate files like will ultimately happen in production. I also want to be able to prompt Claude for revisions and have the output automatically written to my development environment to eliminate my need to copy, paste and refresh my browser to see the result of the output. The development environment also needs to include all required libraries as well as automatically install or remove them when Claude decides to use them or not. In addition, my local dev environment needs to include all images, fonts and other media assets for the project and be easily accessed by Claude to integrate, analyze, etc. I also often provide Claude screenshots of output and would like a method to provide these and store them for Claude so the AI is able to reference them chronologically for the purpose of evaluating the progression of its output. 

Also, I'd like to connect ChatGPT to Claude somehow. I have been using ChatGPT to help me craft detailed prompts for Claude to ensure the tasks being done are crystal clear to the AI. I'd like to be able to have a conversation with ChatGPT about crafting a prompt and once a prompt is where I want it easily send it to Claude without copy and paste to get Claude to begin working on the request.

---

### 🤖 ASSISTANT (2025-12-16T21:33:26.357Z)

Here is an **engineered and expanded version of your original prompt**, optimized for use with ChatGPT (or any other LLM like Claude) to ensure clarity, technical precision, and structured output:

---

### ✅ Expanded & Engineered Prompt:

> **You are my technical assistant helping me design an AI-integrated web development environment for a project called _The Story Portal_. I currently use Claude AI to generate HTML code, which I copy manually into a large single `.html` file (6,283+ lines) in my local Brackets editor. This process is inefficient due to Claude's token limitations and the repetitive copy/paste cycle. I want to streamline everything.**
>
> Please provide a detailed, implementable plan for setting up a **modular, automated, AI-assisted local development workflow** that includes the following components:
>
> ---
>
> ### ✅ Key Requirements:
>
> 1. **Modular Codebase**:
>    - Split the existing monolithic `.html` file into appropriate components (HTML, CSS, JS, assets, etc.).
>    - Follow best practices for project folder structure (e.g. `/src`, `/assets`, `/components`, etc.).
>
> 2. **AI Output Automation**:
>    - Set up a system where Claude AI can write directly to local files instead of me having to copy/paste outputs manually.
>    - The system should automatically update files and refresh the browser (e.g. using a local development server with hot reload).
>
> 3. **Dependency Management**:
>    - Automatically install or remove front-end libraries (e.g. via `npm`, `yarn`, or CDN links) when Claude introduces or removes dependencies.
>
> 4. **Asset Integration**:
>    - Ensure Claude has access to local image files, fonts, and other assets to integrate or analyze them.
>    - Set up a method for referencing these assets in prompts.
>
> 5. **Screenshot Feedback Loop**:
>    - Implement a method for uploading and organizing screenshots or UI captures chronologically.
>    - Claude should be able to access this image timeline to evaluate changes and progression of the UI.
>
> 6. **ChatGPT → Claude Prompt Pipeline**:
>    - I use ChatGPT to write precise prompts for Claude.
>    - I want a workflow where once I finalize a prompt in ChatGPT, I can **send it directly to Claude without copy/paste**.
>    - Propose one or more methods to bridge this interaction (e.g. using an API, shared folder, or interface).
>
> ---
>
> ### 📌 Deliverables:
>
> - Clear folder structure for the modular project.
> - Recommended local dev tools (e.g. Vite, Live Server, Webpack, etc.).
> - Suggested automation tools (e.g. scripts, GitHub Copilot CLI, Claude API integration).
> - Secure method for Claude to read/write files.
> - Screenshot management system.
> - Prompt bridge between ChatGPT and Claude (or workaround).
>
> ---
>
> Structure your answer clearly with headings and short implementation steps under each. My goal is to make this setup as automated, modular, and AI-collaborative as possible.

---

### 📌 How I engineered it:

This new prompt uses **structured sub-sections** that break down your goal into actionable parts, helping the model produce a clearer, more organized response. It uses:
- ✅ **Task framing**: The LLM knows it's acting as a technical assistant.
- 📌 **Bullet structure**: Ensures outputs are easy to follow and implement.
- 🚀 **System-level thinking**: You've moved from a manual task to designing an AI-assisted dev environment.
- 🔄 **Loop handling**: Screenshots, dependency changes, and AI interactions are now described as part of a feedback cycle.

Would you like a version of this prompt designed specifically for Claude too?

---

