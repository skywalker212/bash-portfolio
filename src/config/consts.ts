import { Project } from "@/types";

export const EXPERIENCE_TABLE = [
    ['Company', 'Period', 'Position'],
    ['Sumble', 'August 2024 - Present', 'Software Engineer'],
    ['Infosys Limited', 'October 2021 – July 2022', 'Power Programmer Level II'],
    ['Infosys Limited', 'June 2019 – September 2021', 'Power Programmer Level I']
];

export const INTERNSHIP_TABLE = [
    ['Company', 'Period', 'Position'],
    ['DAIICT', 'Jan 2019 – May 2019', 'Machine Learning Research Intern']
];

export const PROJECTS: { [id: string]: Project } = {
    "bash-portfolio": {
        name: 'Bash Portfolio',
        description: 'A bash-style portfolio website built with Next.js and TypeScript',
        technologies: ['WebAssembly', 'Next.js'],
        link: 'https://github.com/skywalker212/bash-portfolio'
    },
    "tweeter": {
        name: "Tweeter",
        description: "A light-weight twitter clone written in Erlang",
        technologies: ["Erlang", "Cowboy"],
        link: "https://github.com/skywalker212/tweeter"
    },
    "js-argparse": {
        name: "JS-Argparse",
        description: "A lightweight, client-side JavaScript argparse library",
        technologies: ['TypeScript'],
        link: "https://www.npmjs.com/package/js-argparse"
    },
    "shadowfax": {
        name: "Shadowfax",
        description: "A programming language compiler",
        technologies: ["Java", "ASM", "JUnit"],
        link: "https://github.com/skywalker212/shadowfax"
    },
    "hpa-classification": {
        name: "HPA Classification",
        description: "Human Protein Atlas - Cell Atlas protein localization using Machine Learning",
        technologies: ["Python", "Tensorflow"],
        link: "https://github.com/skywalker212/hpa-classification"
    },
    "tiny-shell": {
        name: "Tiny Shell",
        description: "A bash-like shell",
        technologies: ["C"],
        link: "https://github.com/skywalker212/tiny-shell"
    },
    "fitopsy": {
        name: "fitopsY",
        description: "A Spotify-like Music Recommandation Engine",
        technologies: ["Python", "NumPy"],
        link: "https://github.com/skywalker212/fitopsY"
    }
}
