import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { TEMP_FOLDER_PATH } from './const/path.const';

@Injectable()
export class CommonService {

    private readonly logger = new Logger(CommonService.name);
    private readonly folderPath = TEMP_FOLDER_PATH;

    /**
     * EVERY_HOUR - 매시간 정각
     * EVERY_DAY_AT_MIDNIGHT - 매일 00:00
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        this.logger.log('Starting full folder cleanup...');

        try {
        if (fs.existsSync(this.folderPath)) {
            fs.rmSync(this.folderPath, { recursive: true, force: true }); // 폴더 내 모든 데이터 삭제
            fs.mkdirSync(this.folderPath); // 폴더 다시 생성
            this.logger.log('All files and folders inside the directory have been deleted.');
        } else {
            this.logger.warn('Folder does not exist, skipping cleanup.');
        }
        } catch (error: any) {
        this.logger.error(`Error during cleanup: ${error.message}`);
        }
    }
}
