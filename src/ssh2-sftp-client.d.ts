declare module 'ssh2-sftp-client' {
    import { ConnectConfig } from 'ssh2';

    export interface FileInfo {
        type: string;
        name: string;
        size: number;
        modifyTime: number;
        accessTime: number;
        rights: {
            user: string;
            group: string;
            other: string;
        };
        owner: number;
        group: number;
    }

    export default class SFTPClient {
        constructor();
        connect(config: ConnectConfig): Promise<void>;
        list(path: string): Promise<FileInfo[]>;
        get(remotePath: string, localPath: string): Promise<string>;
        put(localPath: string | Buffer | NodeJS.ReadableStream, remotePath: string): Promise<string>;
        delete(remotePath: string): Promise<void>;
        mkdir(remotePath: string, recursive?: boolean): Promise<void>;
        rmdir(remotePath: string, recursive?: boolean): Promise<void>;
        end(): Promise<void>;
        exists(remotePath: string): Promise<boolean | string>;
        stat(remotePath: string): Promise<FileInfo>;
        rename(fromPath: string, toPath: string): Promise<void>;
        chmod(remotePath: string, mode: number | string): Promise<void>;
    }
}
