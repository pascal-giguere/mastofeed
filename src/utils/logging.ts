import chalk from 'chalk';

export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Success = 'SUCCESS',
  Warning = 'WARNING',
  Error = 'ERROR',
}

const LogLevelValues: { [_ in LogLevel]: number } = {
  [LogLevel.Debug]: 0,
  [LogLevel.Info]: 1,
  [LogLevel.Success]: 2,
  [LogLevel.Warning]: 3,
  [LogLevel.Error]: 4,
};

export class Logger {
  readonly minimumLogLevel: LogLevel;
  readonly tag: string;

  constructor(minimumLogLevel: LogLevel = LogLevel.Info, tag?: string) {
    this.minimumLogLevel = minimumLogLevel;
    this.tag = tag ?? 'Mastofeed';
  }

  debug = (msg: string, ...params: unknown[]): void => {
    if (!this.shouldPrint(LogLevel.Debug)) return;
    console.info(`[${chalk.magenta(this.tag)}]`, msg, ...params);
  };
  info = (msg: string, ...params: unknown[]): void => {
    if (!this.shouldPrint(LogLevel.Info)) return;
    console.info(`[${chalk.cyan(this.tag)}]`, msg, ...params);
  };
  success = (msg: string, ...params: unknown[]): void => {
    if (!this.shouldPrint(LogLevel.Success)) return;
    console.info(`[${chalk.greenBright(this.tag)}]`, msg, ...params);
  };
  warn = (msg: string, ...params: unknown[]): void => {
    if (!this.shouldPrint(LogLevel.Warning)) return;
    console.warn(`[${chalk.yellow(this.tag)}]`, msg, ...params);
  };
  error = (msg: string, ...params: unknown[]): void => {
    if (!this.shouldPrint(LogLevel.Error)) return;
    console.error(`[${chalk.red(this.tag)}]`, msg, ...params);
  };

  private shouldPrint = (level: LogLevel): boolean => {
    return LogLevelValues[level] >= LogLevelValues[this.minimumLogLevel];
  };
}
