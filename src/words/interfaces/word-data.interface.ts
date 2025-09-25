/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 新数据源接口定义
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

export interface NewWordData {
  wordRank: number;
  headWord: string;
  content: {
    word: {
      wordHead: string;
      wordId: string;
      content: {
        exam?: Array<{
          question: string;
          answer: {
            explain: string;
            rightIndex: number;
          };
          examType: number;
          choices: Array<{
            choiceIndex: number;
            choice: string;
          }>;
        }>;
        sentence?: {
          sentences: Array<{
            sContent: string;
            sCn: string;
          }>;
          desc: string;
        };
        usphone?: string;
        ukphone?: string;
        ukspeech?: string;
        usspeech?: string;
        phrase?: {
          phrases: Array<{
            pContent: string;
            pCn: string;
          }>;
          desc: string;
        };
        syno?: {
          synos: Array<{
            pos?: string;
            tran: string;
            hwds: Array<{
              w: string;
            }>;
          }>;
          desc: string;
        };
        relWord?: {
          rels: Array<{
            pos: string;
            words: Array<{
              hwd: string;
              tran: string;
            }>;
          }>;
          desc: string;
        };
        remMethod?: {
          val: string;
          desc: string;
        };
        trans: Array<{
          tranCn: string;
          pos?: string;
          descCn: string;
          tranOther?: string;
          descOther?: string;
        }>;
      };
    };
  };
  bookId: string;
}

export interface ImportResultDto {
  success: number;
  failed: number;
  errors: string[];
}
