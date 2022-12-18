import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: 'fps-form-renderer',
  templateUrl: "./fps-form-renderer.component.html",
  styleUrls: ["./fps-form-renderer.component.css"]
})
export class FpsFormRendererComponent implements OnInit {

  @Input("json") JSON: any;
  @Input("form_type") FORMTYPE: any;
  @Output() result = new EventEmitter();
  //@Output() totalScore = new EventEmitter();
  @ViewChild("surveyform") surveyform: NgForm;

  questiongroups: any[] = [];
  formType: string;
  objEvaluationForm: any = {
    status: false
  };
  constructor() { }

  ngOnInit() {
    this.questiongroups = this.JSON ? this.JSON : [];
    this.formType = this.FORMTYPE ? this.FORMTYPE : '';
  }

  ngOnChanges(changes) {
    this.questiongroups = changes.JSON.currentValue;
    if (changes.FORMTYPE) {
      this.formType = changes.FORMTYPE.currentValue;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setGroupAndQuestionScore();
    }, 10);
  }

  getGroupScore(groupid: number) {
    try {
      let total = 0;
      let actual = 0;
      let gained = 0;
      let actual_weight = 0;
      const grp = this.questiongroups.find(g => g.groupid === groupid);
      if (grp.percentage) {
        grp.questions.forEach(q => {
          if (q.questiontype === "lineitems") {
            q.subgroups.forEach(sq => {
              if (sq.score && sq.selectedscore && this.formType !== '2') {
                total = total + +sq.weightage;
                actual = actual + sq.selectedscore;
              }
              if (this.formType === '2' && sq.value !== "NA") {
                //actual_weight = actual_weight + +sq.actual_weightage
                actual_weight = actual_weight + +sq.weightage
              }
              if (this.formType === '2' && sq.actual_weightage_score) {
                if (sq.gained_weight) {
                  gained = gained + sq.gained_weight;
                }
                //actual_weight = actual_weight + sq.actual_weightage_score
              }
            });
          } else {
            if (q.score && q.selectedscore) {
              if (this.formType === '2') {
                if (q.gained_weight) {
                  gained = gained + q.gained_weight;
                }
                if (q.value !== "NA") {
                  //actual_weight = actual_weight + +q.actual_weightage
                  actual_weight = actual_weight + +q.weightage
                }
                //actual_weight = actual_weight + q.actual_weightage_score
              }
              else {
                total = total + +q.weightage;
                actual = actual + q.selectedscore;
              }
            }
          }
        });
      }
      if (this.formType === '2') {
        var result = (gained / actual_weight) * 100;
        total = isNaN(result) ? 0 : result;
      }
      this.questiongroups.find(
        g => g.groupid === groupid
      ).scorepercentage = total;
      this.questiongroups.find(
        g => g.groupid === groupid
      ).actualpercentage = total;
      return total;

    } catch (e) {
      this.logUnknownError(e);
    }
  }

  calculateFailureCount(groupid: number) {
    try {
      let count = 0;
      const grp = this.questiongroups.find(g => g.groupid === groupid);
      grp.questions.forEach(q => {
        if (q.questiontype === 'lineitems') {
          q.subgroups.forEach(sq => {
            if (sq.value && sq.value.toLowerCase() === 'yes') {
              count = count + 1;
            }
          });
        }
      });
      return count;
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  //Select All Question
  setScoreAndValueForLineItems(
    groupid: number,
    questionid: number,
    value: string
  ) {
    try {
      this.questiongroups
        .find(g => g.groupid === groupid)
        .questions.find(q => q.questionid === questionid)
        .subgroups.map(sq => {
          sq.value = value;
          if (sq.score) {
            sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
            if (this.formType === '2') {
              if (value === 'NA') {
                sq.actual_weightage_score = 0;
              }
              else if (value === 'No' || value === 'Yes') {
                sq.actual_weightage_score = +sq.weightage;
                if (value === 'Yes') {
                  /*sq.gained_weight = sq.score[value];*/
                  sq.gained_weight = +sq.weightage;
                }
                else {
                  sq.gained_weight = 0;
                }
              }
            }
          }
        });
      // this.getTotalPercentage();
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  // Each Question selection
  setLineItemScoreValue(
    groupid: number,
    questionid: number,
    squestionid: number,
    value: string,
    scoreoptions: any
  ) {
    try {
      this.resetLineItemsSelectAllHeader(groupid, questionid, value);
      this.questiongroups
        .find(g => g.groupid === groupid)
        .questions.find(q => q.questionid === questionid)
        .subgroups.map(sq => {
          if (sq.questionid === squestionid) {
            sq.value = value;
            if (sq.score) {
              sq.selectedscore = (+sq.weightage * sq.score[value]) / 100;
              if (this.formType === '2') {
                if (value === 'NA') {
                  sq.actual_weightage_score = 0;
                }
                else if (value === 'No' || value === 'Yes') {
                  sq.actual_weightage_score = +sq.weightage;
                  if (value === 'Yes') {
                    /*sq.gained_weight = sq.score[value];*/
                    sq.gained_weight = +sq.weightage;
                  }
                  else {
                    sq.gained_weight = 0;
                  }
                }
              }
            }
          }
        });
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  resetLineItemsSelectAllHeader(
    groupid: number,
    questionid: number,
    value: string
  ) {
    try {
      const question = this.questiongroups
        .find(g => g.groupid === groupid)
        .questions.find(q => q.questionid === questionid);
      question.value = question.value === value ? value : '';
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  getGroupPercentByName(questiongroup: any) {
    try {
      if (this.formType !== '2') {
        if (questiongroup.groupname.toUpperCase().includes('COMPLIANCE')) {
          return 0.3;
        }
        if (
          questiongroup.groupname.toUpperCase().includes('CUSTOMER EXPERIENCE')
        ) {
          return 0.7;
        }
        return 1;
      } else if (this.formType === '2') {
        if (questiongroup.groupname.toUpperCase() == 'COMPLIANCE' || questiongroup.groupname.toUpperCase() == 'CUSTOMER EXPERIENCE') {
          return 0.5;
        }
        if (questiongroup.groupname.toUpperCase() == 'CALL COMPLIANCE') {
          return 0.3;
        }
        if (
          questiongroup.groupname.toUpperCase() == 'COMMUNICATION AND COURTESY') {
          return 0.7;
        }
        return 1;
      }
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  getTotalPercentage() {
    try {
      let total = 0;
      this.questiongroups.forEach(group => {
        if (
          group.groupmode &&
          group.groupmode.toLowerCase() === 'auto-failure'
        ) {
          group.questions.forEach(q => {
            if (q.questiontype === 'lineitems') {
              q.subgroups.forEach(sq => {
                if (sq.value && sq.value.toLowerCase() === 'yes') {
                  total = -400;
                }
              });
            }
          });
        } else {
          if (group.percentage) {
            if (group.actualpercentage) {
              const multiplier = this.getGroupPercentByName(group);
              total = total + group.actualpercentage * multiplier;
            } else {
              const value = this.getGroupScore(group.groupid);
              total = total + value;
            }
          }
        }
      });
      // this.totalScore.emit({
      //   percentage: total < 0 ? 0 : total
      // });
      let overAllTotal = total < 0 ? 0 : total
      this.onSubmit(overAllTotal);
      return overAllTotal;
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  onSubmit(overAllTotal) {
    try {
      // this.objEvaluationForm.status = status;
      // this.objEvaluationForm.acknowledged_status =
      //   status === "submitted" ? "pending" : "Yet to Evaluate";

      // this.objEvaluationForm.status = status;
      // this.objEvaluationForm.acknowledged_status = status === 'submitted' ? 'Yet To Be Acknowledged' : 'Yet to Evaluate';
      const questionAnswers: any[] = [];
      const questionGroupAnswers: any[] = [];
      // let scorableQuestions = false;
      let groupTotal = 0;
      this.questiongroups.forEach(qgroup => {
        // scorableQuestions = false;
        groupTotal = 0;
        qgroup.questions.forEach(question => {
          if (question.subgroups && question.subgroups.length > 0) {
            if (question.questiontype === 'lineitems') {
              // question.value = 'NA';
              // question.score = 0;
            }
            questionAnswers.push(this.createQuestionAnswerObj(question));
            question.subgroups.map(squestion => {
              const squestionAnswer = this.createQuestionAnswerObj(squestion);
              if (qgroup.groupmode === 'default') {
                groupTotal += +squestionAnswer.score;
              }
              if (
                qgroup.groupmode === 'auto-failure' &&
                squestionAnswer.answertext === 'Yes'
              ) {
                groupTotal += 1;
              }
              questionAnswers.push(squestionAnswer);
            });
          } else {
            questionAnswers.push(this.createQuestionAnswerObj(question));
          }
        });
        if (qgroup.groupmode !== 'no-score') {
          const questionGroupAnswer: any = this.createQuestionGroupAnswerObj(
            qgroup
          );
          // questionGroupAnswer.obscore = groupTotal;
          // questionGroupAnswer.questions = undefined;
          questionGroupAnswers.push(questionGroupAnswer);
        }
      });

      this.result.emit({
        question: questionAnswers,
        group: questionGroupAnswers,
        form: this.surveyform,
        totalScore: overAllTotal
      });
      //this.createSurvey(questionAnswers);
    } catch (e) {
      this.logUnknownError(e);
    }
  }
  // onSubmit() {
  //   try {
  //     //this..status = status;
  //     // this.objEvaluationForm.acknowledged_status = status === 'submitted' ? 'Yet To Be Acknowledged' : 'Yet to Evaluate';
  //     const questionAnswers: any[] = [];
  //     const questionGroupAnswers: any[] = [];
  //     // let scorableQuestions = false;
  //     let groupTotal = 0;
  //     this.questiongroups.forEach(qgroup => {
  //       // scorableQuestions = false;
  //       groupTotal = 0;
  //       qgroup.questions.forEach(question => {
  //         if (question.subgroups && question.subgroups.length > 0) {
  //           if (question.questiontype === 'lineitems') {
  //             // question.value = 'NA';
  //             // question.score = 0;
  //           }
  //           questionAnswers.push(this.createQuestionAnswerObj(question));
  //           question.subgroups.map(squestion => {
  //             const squestionAnswer = this.createQuestionAnswerObj(squestion);
  //             if (qgroup.groupmode === 'default') {
  //               groupTotal += +squestionAnswer.score;
  //             }
  //             if (qgroup.groupmode === 'auto-failure' && squestionAnswer.answertext === 'Yes') {
  //               groupTotal += 1;
  //             }
  //             questionAnswers.push(squestionAnswer);
  //           });
  //         } else {
  //           questionAnswers.push(this.createQuestionAnswerObj(question));
  //         }
  //       });
  //       if (qgroup.groupmode !== 'no-score') {
  //         const questionGroupAnswer = this.createQuestionGroupAnswerObj(qgroup);
  //         //questionGroupAnswer.obscore = groupTotal;
  //         //questionGroupAnswer.questions = undefined;
  //         questionGroupAnswers.push(questionGroupAnswer);
  //       }

  //     });
  //     this.result.emit({
  //       question: questionAnswers,
  //       group: questionGroupAnswers,
  //       form: this.surveyform
  //     });

  //     //this.createSurvey(questionAnswers, questionGroupAnswers);
  //   } catch (e) {
  //     this.logUnknownError(e);
  //   }
  // }

  setGroupAndQuestionScore() {
    try {
      this.questiongroups.map(group => {
        if (group.percentage) {
          group.questions.map(question => {
            if (question.questiontype === 'lineitems') {
              question.value = '';
              question.subgroups.map(squestion => {
                squestion.selectedscore = squestion.score[squestion.value];
                if (this.formType === '2') {
                  if (squestion.value === 'NA') {
                    squestion.actual_weightage_score = 0;
                  }
                  else if (squestion.value === 'No' || squestion.value === 'Yes') {
                    squestion.actual_weightage_score = +squestion.weightage;
                    if (squestion.value === 'Yes') {
                      // squestion.gained_weight = squestion.score[squestion.value];
                      squestion.gained_weight = +squestion.weightage;
                    }
                    else {
                      squestion.gained_weight = 0;
                    }
                  }
                }
              });
            }
          });
        }
        group.actualpercentage = this.getGroupScore(group.groupid);
        // this.getTotalPercentage();
      });
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  createQuestionAnswerObj(question) {
    try {
      const questionanswer = {
        questionid: '',
        answertext: '',
        body: '',
        score: ''
      };
      questionanswer.questionid = question.questionid;
      questionanswer.answertext = question.value || ' ';
      questionanswer.body = question.comment;
      questionanswer.score = question.selectedscore || 0;
      return questionanswer;
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  createQuestionGroupAnswerObj(question) {
    try {
      const questionanswer = {
        groupid: 0,
        groupname: 0,
        obscore: 0
      };
      questionanswer.groupid = +question.groupid;
      questionanswer.groupname = question.groupname;
      questionanswer.obscore = question.scorepercentage ? question.scorepercentage : 0;
      return questionanswer;
    } catch (e) {
      this.logUnknownError(e);
    }
  }

  logUnknownError(error) {
    console.log(error);
  }

}
