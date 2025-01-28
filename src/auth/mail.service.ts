import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.NODE_MAILER_ID,
                pass: process.env.NODE_MAILER_PASSWORD,
            },
        });
    }

    /**
     * 이메일 인증번호 발송하기
     * @param email 수신자 이메일
     * @param token 인증번호
     * @returns 
     */
    async sendVerificationEmail(email: string) {
        const authNum = Math.floor(100000 + Math.random() * 900000).toString(); //인증번호
        const cacheKey = email.toLocaleLowerCase(); //모두 소문자로 바꿔서 키를 일관되게 만듬
        
        const mailOptions = {
            from: `"MyApp" <no-reply@myapp.com>`, // 발신자 설정
            to: email,
            subject: '마이앤마이 이메일 인증번호',
            html: `<p>인증번호:${authNum}</p>`
        };

        try {
            await this.cacheManager.set(cacheKey, authNum); // 5분(300초) 저장
            await this.transporter.sendMail(mailOptions); // 메일 전송

            return { message: `인증번호 발송. 이메일을 확인해주세요` };
        } catch (error) {
            throw new Error(`이메일 전송 실패: ${(error as Error).message}`);
        }
    }

    /**
     * 인증번호 확인하기
     * @param email 이메일
     * @param code 사용자 입력 코드
     */
        async verifyEmailCode(email: string, code: string) {
            const cacheKey = email.toLocaleLowerCase(); //모두 소문자로 바꿔서 키를 일관되게 만듬
            const storedCode = await this.cacheManager.get<string>(cacheKey);
    
            if (!storedCode) {
                throw new NotFoundException('인증번호가 만료되었거나 존재하지 않습니다.');
            }
    
            if (storedCode !== code) {
                throw new NotFoundException('인증번호가 일치하지 않습니다.');
            }
    
            await this.cacheManager.del(cacheKey); // 인증 후 삭제
            await this.cacheManager.set(email, "true", 1000 * 60 * 20) // 20분 저장

            return { message: '이메일 인증이 완료되었습니다.' };
        }
}



