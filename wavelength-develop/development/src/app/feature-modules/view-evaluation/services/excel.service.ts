
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from 'exceljs';
import * as fs from 'file-saver';
import { Buffer } from 'buffer';
import { EvaluationForm } from '../../../core-models/evaluationform';
import { EvaluationQuestionGroup } from '../../../core-models/evaluationquestiongroup';

export class ExcelService {

    objEvaluationForm: EvaluationForm;

    exportSurveyToExcel(surveyform: EvaluationForm) {

        this.objEvaluationForm = surveyform;

        const workbook: ExcelProper.Workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Evaluation Report');

        this.addAgentInformation(worksheet, surveyform);
        this.addSurveyTitle(worksheet, surveyform);
        worksheet.addRow([]);

        this.addAgentHeaderDetails(worksheet, surveyform);
        worksheet.addRow([]);
        worksheet.addRow([]);

        for (const questiongroup of (surveyform.questiongroups ? surveyform.questiongroups : [])) {
            switch (questiongroup.groupmode) {
                case 'no-score': {
                    this.addNonNumericDetails(worksheet, questiongroup);
                    break;
                }
                case 'auto-failure': {
                    this.addNegativeDetails(worksheet, questiongroup);
                    break;
                }
                default: {
                    this.addQuestionColumnHeader(worksheet);
                    this.addDefaultDetails(worksheet, questiongroup);
                }
            }
        }

        // Footer Row
        this.addAgentInformation(worksheet, surveyform);

        worksheet.getColumn(1).width = 40;
        worksheet.getColumn(2).width = 18;
        worksheet.getColumn(3).width = 18;

        workbook.xlsx.writeBuffer().then((fdata) => {
            const b = new Buffer(this.toArrayBuffer(fdata));
            const blob = new Blob([b], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const calldetails = surveyform.calldetails;
            let calldatetime = 'no-date';
            if (calldetails && calldetails != null) {
                calldatetime = `${calldetails.created_at}`.split(':').join('-').split(' ').join('_');
            }

            // tslint:disable-next-line:max-line-length
            const filename = `${surveyform.calldetails['agentname'].replace(/ /g, '_').replace(/,/g, '_')}_${calldatetime}.xlsx`;

            fs.saveAs(blob, filename);
        });
    }

    toArrayBuffer(buf) {
        const ab = new ArrayBuffer(buf.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    addQuestionColumnHeader(worksheet: any) {
        const questionheaderRow = worksheet.addRow(['Questions', 'Score', 'Comments']);
        questionheaderRow.font = { bold: true };
        questionheaderRow.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DCE6F1' },
                bgColor: { argb: 'DCE6F1' }
            };
            cell.font = { size: 14, bold: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        worksheet.addRow([]);
    }

    addNonNumericDetails(worksheet: any, questiongroup: EvaluationQuestionGroup) {
        const groups = worksheet.addRow([
            questiongroup.groupname, 'Values'
        ]);
        groups.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DCE6F1' },
                bgColor: { argb: 'DCE6F1' }
            };
            cell.font = { size: 13, bold: true };
        });

        for (const question of (questiongroup.questions ? questiongroup.questions : [])) {
            const questionRow = worksheet.addRow([
                question.questiontitle, question.value
            ]);
            questionRow.font = { size: 11, bold: true };
            for (const subquestion of (question.subgroups ? question.subgroups : [])) {
                worksheet.addRow([
                    subquestion.questiontitle, subquestion.value
                ]);
            }
        }
        worksheet.addRow([]);
    }

    addDefaultDetails(worksheet: any, questiongroup: EvaluationQuestionGroup) {
        let groupScore = 0;
        const objgroupscore = this.getGroupScore(questiongroup.groupid);
        if (objgroupscore) {
            switch (questiongroup.groupmode.trim().toLowerCase()) {
                case 'default': {
                    groupScore = +(objgroupscore.obscore).toFixed(1);
                    break;
                }
                case 'auto-failure': {
                    groupScore = +(objgroupscore.obscore);
                    break;
                }
                default: {
                }
            }
        }
        const groups = worksheet.addRow([
            questiongroup.groupname, groupScore, ''
        ]);
        groups.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DCE6F1' },
                bgColor: { argb: 'DCE6F1' }
            };
            cell.font = { size: 13, bold: true };
        });

        for (const question of (questiongroup.questions ? questiongroup.questions : [])) {
            const questionRow = worksheet.addRow([
                question.questiontitle, question.score ? +question.score : 0, question.comment ? question.comment : ''
            ]);
            questionRow.font = { size: 11, bold: true };
            let sum = 0;
            for (const subquestion of (question.subgroups ? question.subgroups : [])) {
                let score;
                if (subquestion.score) {
                    score = 0;
                    if (+subquestion.score[subquestion.value] !== 0) {
                        score = ((+subquestion.weightage) / (+subquestion.score[subquestion.value])) * 100;
                    }
                    sum = sum + score;
                } else {
                    score = subquestion.value;
                }
                worksheet.addRow([
                    subquestion.questiontitle, score, subquestion.comment ? subquestion.comment : ''
                ]);
            }
            questionRow.getCell(2).value = sum;
        }
        worksheet.addRow([]);
    }

    addNegativeDetails(worksheet: any, questiongroup: EvaluationQuestionGroup) {
        let gtotal = 0;
        const groups = worksheet.addRow([
            questiongroup.groupname, 0, ''
        ]);
        groups.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DCE6F1' },
                bgColor: { argb: 'DCE6F1' }
            };
            cell.font = { size: 13, bold: true };
        });

        for (const question of (questiongroup.questions ? questiongroup.questions : [])) {
            const questionRow = worksheet.addRow([
                question.questiontitle, 0, question.comment ? question.comment : ''
            ]);
            questionRow.font = { size: 11, bold: true };
            let sum = 0;
            for (const subquestion of (question.subgroups ? question.subgroups : [])) {
                let score = 0;
                if (subquestion.value.toLowerCase() === 'yes') {
                    score = 1;
                }
                worksheet.addRow([
                    subquestion.questiontitle, score, subquestion.comment ? subquestion.comment : ''
                ]);
                sum = sum + score;
            }
            gtotal = gtotal + sum;
            questionRow.getCell(2).value = sum;
        }
        groups.getCell(2).value = gtotal;
        groups.getCell(2).font = { size: 13, bold: true, color: { argb: 'FF0000' } };
        worksheet.addRow([]);
    }

    addAgentHeaderDetails(worksheet: any, surveyform: EvaluationForm) {
        // worksheet.addRow(['Agent Name', surveyform.agentname]).alignment = { wrapText: true };
        // worksheet.addRow(['Agent Id', surveyform.agentid]).alignment = { wrapText: true };
        // worksheet.addRow(['Call Id', surveyform.callid]).alignment = { wrapText: true };
        // worksheet.addRow(['Evaluator Name', surveyform.evaluatorname]).alignment = { wrapText: true };
        let clr = '';
        switch (surveyform.severity_name.toLowerCase()) {
            case 'high': {
                clr = 'F52C2C';
                break;
            }
            case 'medium': {
                clr = 'FFBD13';
                break;
            }
            case 'medium': {
                clr = '25B93D';
                break;
            }
            default: {
                clr = '000000';
                break;
            }
        }
        for (const header of (surveyform.headers ? surveyform.headers : [])) {
            worksheet.addRow([header.name, header.value]).alignment = { wrapText: true };
        }
        const severity_name = worksheet.addRow(['Severity', `${surveyform.evaluation_disposition_name} `]);
        severity_name.font = { bold: true, color: { argb: clr} };
        const scorecell = worksheet.addRow(['Score', `${surveyform.finalscore} %`]);
        scorecell.font = { bold: true, color: { argb: (+surveyform.finalscore > 50) ? '008000' : 'FF0000' } };
    }

    addSurveyTitle(worksheet: any, surveyform: EvaluationForm) {
        const headerRow = worksheet.addRow([`${surveyform.description}`]);
        headerRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DCE6F1' }
        };
        headerRow.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        headerRow.font = { size: 16, bold: true };
        // Merge Cells
        worksheet.mergeCells(`A${headerRow.number}:F${headerRow.number}`);
    }

    addAgentInformation(worksheet: any, surveyform: EvaluationForm) {
        const topfooterRow =
            worksheet.addRow([`Evaluation report of ${surveyform.calldetails['agentname']} for callid ${surveyform.call_id}`]);
        topfooterRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DCE6F1' }
        };
        topfooterRow.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Merge Cells
        worksheet.mergeCells(`A${topfooterRow.number}:F${topfooterRow.number}`);
    }

    getGroupScore(groupid: number) {
        try {
            if (this.objEvaluationForm.group_score) {
                return this.objEvaluationForm.group_score.find(x => +x.groupid === groupid);
            } else {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }
    }
}
