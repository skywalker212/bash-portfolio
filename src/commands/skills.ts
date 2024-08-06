import { Command, CommandResultType, TableCommandResult, TableType } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "skills";
const description = "List my technical skills";

const skillsArgs = new ArgumentParser(name, description);

export const skillsCommand: Command = {
    name,
    args: skillsArgs,
    description,
    execute: (): TableCommandResult => {
        return {
            content: [
                ['Category', 'Skills'],
                ['Languages', 'Python, TypeScript, Java, Erlang'],
                ['Frontend', 'Next.js, Angular, React'],
                ['Backend', 'Node.js, Express, FastAPI'],
                ['Databases', 'MongoDB, Elasticsearch, Redis, PostgreSQL'],
                ['DevOps', 'Kubernetes, Jenkins, JFrog Artifactory'],
                ['Other', 'WebAssembly, PyTorch, Apache Kafka, GraphQL, Jaeger, Ghidra']
            ],
            type: CommandResultType.TABLE,
            tableType: TableType.NORMAL,
            columns: [{width: 15}, {width: 41, wrapWord: true}]
        };
    }
};