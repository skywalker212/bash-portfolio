import { Command, CommandResultType, TableCommandResult, TableType } from '@/types';

export const skillsCommand: Command = {
    name: 'skills',
    description: 'List my technical skills',
    execute: (): TableCommandResult => {
        return {
            content: [
                ['Category', 'Skills'],
                ['Languages', 'Python, TypeScript, Java, Erlang'],
                ['Frontend', 'Next.js, Angular, React'],
                ['Backend', 'Node.js, Express, FastAPI'],
                ['Databases', 'MongoDB, Elasticsearch, Redis, PostgreSQL'],
                ['DevOps', 'Kubernetes, Jenkins, JFrog Artifactory'],
                ['Other', 'PyTorch, Apache Kafka, GraphQL, Jaeger, Ghidra']
            ],
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 41, wrapWord: true}]
        };
    }
};