// ==UserScript==
// @name         ChatGPT降级检测
// @namespace    https://github.com/KoriIku/chatgpt-degrade-checker
// @homepage     https://github.com/KoriIku/chatgpt-degrade-checker
// @author       KoriIku
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzJjM2U1MCIgZD0iTTMyIDJDMTUuNDMyIDIgMiAxNS40MzIgMiAzMnMxMy40MzIgMzAgMzAgMzAgMzAtMTMuNDMyIDMwLTMwUzQ4LjU2OCAyIDMyIDJ6bTAgNTRjLTEzLjIzMyAwLTI0LTEwLjc2Ny0yNC0yNFMxOC43NjcgOCAzMiA4czI0IDEwLjc2NyAyNCAyNFM0NS4yMzMgNTYgMzIgNTZ6Ii8+PHBhdGggZmlsbD0iIzNkYzJmZiIgZD0iTTMyIDEyYy0xMS4wNDYgMC0yMCA4Ljk1NC0yMCAyMHM4Ljk1NCAyMCAyMCAyMCAyMC04Ljk1NCAyMC0yMFM0My4wNDYgMTIgMzIgMTJ6bTAgMzZjLTguODM3IDAtMTYtNy4xNjMtMTYtMTZzNy4xNjMtMTYgMTYtMTYgMTYgNy4xNjMgMTYgMTZTNDAuODM3IDQ4IDMyIDQ4eiIvPjxwYXRoIGZpbGw9IiMwMGZmN2YiIGQ9Ik0zMiAyMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMlMzOC42MjcgMjAgMzIgMjB6bTAgMjBjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzIiIGN5PSIzMiIgcj0iNCIvPjwvc3ZnPg==
// @version      1.92
// @description  由于 ChatGPT 会对某些 ip 进行无提示的服务降级，此脚本用于检测你的 ip 在 ChatGPT 数据库中的风险等级。
// @match        *://chatgpt.com/*
// @grant        none
// @license AGPLv3
// @downloadURL https://update.greasyfork.org/scripts/516051/ChatGPT%E9%99%8D%E7%BA%A7%E6%A3%80%E6%B5%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/516051/ChatGPT%E9%99%8D%E7%BA%A7%E6%A3%80%E6%B5%8B.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建显示框
    const displayBox = document.createElement('div');
    displayBox.style.position = 'fixed';
    displayBox.style.top = '50%';
    displayBox.style.right = '20px';
    displayBox.style.transform = 'translateY(-50%)';
    displayBox.style.width = '220px';
    displayBox.style.padding = '10px';
    displayBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    displayBox.style.color = '#fff';
    displayBox.style.fontSize = '14px';
    displayBox.style.borderRadius = '8px';
    displayBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    displayBox.style.zIndex = '10000';
    displayBox.style.transition = 'all 0.3s ease';
    displayBox.style.display = 'none';

    displayBox.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>PoW 信息</strong>
        </div>
        <div id="content">
            PoW难度: <span id="difficulty">N/A</span><span id="difficulty-level" style="margin-left: 3px"></span>
            <span id="difficulty-tooltip" style="
                cursor: pointer;
                color: #fff;
                font-size: 12px;
                display: inline-block;
                width: 14px;
                height: 14px;
                line-height: 14px;
                text-align: center;
                border-radius: 50%;
                border: 1px solid #fff;
                margin-left: 3px;
            ">?</span><br>
            IP质量: <span id="ip-quality">N/A</span><br>
            <span id="persona-container" style="display: none">用户类型: <span id="persona">N/A</span></span>
        </div>
        <div style="
            margin-top: 12px;
            padding-top: 8px;
            border-top: 0.5px solid rgba(255, 255, 255, 0.15);
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            letter-spacing: 0.3px;
        ">
            ChatGPT Degrade Checker
    </div>`;
    document.body.appendChild(displayBox);

    // 创建收缩状态的指示器
    const collapsedIndicator = document.createElement('div');
    collapsedIndicator.style.position = 'fixed';
    collapsedIndicator.style.top = '50%';
    collapsedIndicator.style.right = '20px';
    collapsedIndicator.style.transform = 'translateY(-50%)';
    collapsedIndicator.style.width = '32px';
    collapsedIndicator.style.height = '32px';
    collapsedIndicator.style.backgroundColor = 'transparent';
    collapsedIndicator.style.borderRadius = '50%';
    collapsedIndicator.style.cursor = 'pointer';
    collapsedIndicator.style.zIndex = '10000';
    collapsedIndicator.style.padding = '4px';
    collapsedIndicator.style.display = 'flex';
    collapsedIndicator.style.alignItems = 'center';
    collapsedIndicator.style.justifyContent = 'center';
    collapsedIndicator.style.transition = 'all 0.3s ease';

    // 使用SVG作为指示器
    collapsedIndicator.innerHTML = `
    <svg id="status-icon" width="32" height="32" viewBox="0 0 64 64" style="transition: all 0.3s ease;">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2ecc71;stop-opacity:1" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g id="icon-group" filter="url(#glow)">
            <circle cx="32" cy="32" r="28" fill="url(#gradient)" stroke="#fff" stroke-width="2"/>
            <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="100">
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 32 32"
                    to="360 32 32"
                    dur="8s"
                    repeatCount="indefinite"/>
            </circle>
            <circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="2">
                <animate
                    attributeName="r"
                    values="12;14;12"
                    dur="2s"
                    repeatCount="indefinite"/>
            </circle>
            <circle id="center-dot" cx="32" cy="32" r="4" fill="#fff">
                <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"/>
            </circle>
        </g>
    </svg>`;
    document.body.appendChild(collapsedIndicator);

    // 鼠标悬停事件
    collapsedIndicator.addEventListener('mouseenter', function() {
        displayBox.style.display = 'block';
        collapsedIndicator.style.opacity = '0';
    });

    displayBox.addEventListener('mouseleave', function() {
        displayBox.style.display = 'none';
        collapsedIndicator.style.opacity = '1';
    });

    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.innerText = '这个值越小，代表PoW难度越高，ChatGPT认为你的IP风险越高。';
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '12px';
    tooltip.style.visibility = 'hidden';
    tooltip.style.zIndex = '10001';
    tooltip.style.width = '240px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);

    // 显示提示
    document.getElementById('difficulty-tooltip').addEventListener('mouseenter', function(event) {
        tooltip.style.visibility = 'visible';

        const tooltipWidth = 240;
        const windowWidth = window.innerWidth;
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let leftPosition = mouseX - tooltipWidth - 10;
        if (leftPosition < 10) {
            leftPosition = mouseX + 20;
        }

        let topPosition = mouseY - 40;

        tooltip.style.left = `${leftPosition}px`;
        tooltip.style.top = `${topPosition}px`;
    });

    // 隐藏提示
    document.getElementById('difficulty-tooltip').addEventListener('mouseleave', function() {
        tooltip.style.visibility = 'hidden';
    });

    // 更新difficulty指示器
    function updateDifficultyIndicator(difficulty) {
        const difficultyLevel = document.getElementById('difficulty-level');
        const ipQuality = document.getElementById('ip-quality');

        if (difficulty === 'N/A') {
            setIconColors('#888', '#666');
            difficultyLevel.innerText = '';
            ipQuality.innerHTML = 'N/A';
            return;
        }

        const cleanDifficulty = difficulty.replace('0x', '').replace(/^0+/, '');
        const hexLength = cleanDifficulty.length;

        let color, secondaryColor, textColor, level, qualityText;

        if (hexLength <= 2) {
            color = '#F44336';
            secondaryColor = '#d32f2f';
            textColor = '#ff6b6b';
            level = '(困难)';
            qualityText = '高风险';
        } else if (hexLength === 3) {
            color = '#FFC107';
            secondaryColor = '#ffa000';
            textColor = '#ffd700';
            level = '(中等)';
            qualityText = '中等';
        } else if (hexLength === 4) {
            color = '#8BC34A';
            secondaryColor = '#689f38';
            textColor = '#9acd32';
            level = '(简单)';
            qualityText = '良好';
        } else {
            color = '#4CAF50';
            secondaryColor = '#388e3c';
            textColor = '#98fb98';
            level = '(极易)';
            qualityText = '优秀';
        }

        setIconColors(color, secondaryColor);
        difficultyLevel.innerHTML = `<span style="color: ${textColor}">${level}</span>`;
        ipQuality.innerHTML = `<span style="color: ${textColor}">${qualityText}</span>`;
    }

    function setIconColors(primaryColor, secondaryColor) {
        const gradient = document.querySelector('#gradient');
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        `;
    }

    // 拦截 fetch 请求
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        console.log(args)
        let url = args[0];
        let method = args[1]?.method;
        if (typeof url == "object") {
            url = args[0].url;
            method = args[0].method;
        }
        console.log(url, method);
        if ((url.includes('/backend-api/sentinel/chat-requirements')||url.includes('backend-anon/sentinel/chat-requirements')) && method === 'POST') {
            const clonedResponse = response.clone();
            clonedResponse.json().then(data => {
                const difficulty = data.proofofwork ? data.proofofwork.difficulty : 'N/A';
                const persona = data.persona || 'N/A';
                document.getElementById('difficulty').innerText = difficulty;

                const personaContainer = document.getElementById('persona-container');
                if (persona && !persona.toLowerCase().includes('free')) {
                    personaContainer.style.display = 'block';
                    document.getElementById('persona').innerText = persona;
                } else {
                    personaContainer.style.display = 'none';
                }

                updateDifficultyIndicator(difficulty);
            }).catch(e => console.error('解析响应时出错:', e));
        }
        return response;
    };
})();
