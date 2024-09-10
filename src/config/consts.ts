import { Project } from "@/types";

export const WHOAMI_TEXT = 'My name is Akash Gajjar. With a passion for technology and a drive to make a difference, I am always on the lookout for new challenges and opportunities to grow as a professional. I have earned a Master\'s degree in Computer Science from the University of Florida. My current interests include Machine Learning, Cyber Security, and Web Applications.\nI hold a B Tech in ICT from Dhirubhai Ambani Institute of Information and Communication Technology and have a strong background in Web Technologies. My technical skills include proficiency in Linux/Unix systems, TypeScript, Java, C/C++, Python, and various databases and frameworks. I am a quick learner and a team player, and I am eager to use my skills and expertise to drive innovation and solve complex problems in the field. I am currently on an F1 visa and eligible for STEM OPT for 3 years.';

export const EXPERIENCE_TABLE = [
    ['Company', 'Period', 'Position'],
    ['Infosys Limited', 'October 2021 – July 2022', 'Power Programmer Level II'],
    ['Infosys Limited', 'June 2019 – September 2021', 'Power Programmer Level I']
];

export const INTERNSHIP_TABLE = [
    ['Company', 'Period', 'Position'],
    ['Sumble', 'August 2024 - Present', 'Software Engineer Intern'],
    ['DAIICT', 'Jan 2019 – May 2019', 'Machine Learning Research Intern']
];

export const PROJECTS: { [id: string]: Project } = {
    "equinox-studio": {
        name: "Infosys Equinox Studio",
        description: "Low-code digital commerce front-end builder",
        technologies: ["Node.js", "Angular", "MongoDB", "Kubernetes", "Kafka"],
        link: "https://www.infosysequinox.com/offerings/infosys-equinox-studio.html"
    },
    "bash-portfolio": {
        name: 'Bash Portfolio',
        description: 'A bash-style portfolio website built with Next.js and TypeScript',
        technologies: ['WebAssembly', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'],
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