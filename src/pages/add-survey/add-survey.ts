import { Http } from '@angular/http';
import { NgForm } from '@angular/forms/src/directives';
import { Survey } from '../../models/survey/survey.interface';
import { AuthService } from './../../providers/auth/auth.service';
import { User } from 'firebase/app';
import { DataService } from './../../providers/data/data.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
} from 'ionic-angular';
import { Base64 } from '@ionic-native/base64';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureAudioOptions } from '@ionic-native/media-capture';
import { ImagePicker } from '@ionic-native/image-picker';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';

@IonicPage({
  segment: 'add-survey',
  defaultHistory: ['TabsPage']
})
@Component({
  selector: 'page-add-survey',
  templateUrl: 'add-survey.html',
})
export class AddSurveyPage implements OnInit {

  types = ["Single", "Multiple", "Comments"];
  selectedOption = this.types[0];
  type: string;
  testRadioOpen: boolean;
  typeSingle = true;
  imageUrl: any;
  private authenticatedUser: User;
  survey = {} as Survey;
  optionsData = [];
  commentsData = [];
  optionsCount: number;
  optionsDataCount: number;
  commentsDataCount: number;
  addDateTime: boolean;
  showDateTime = false;
  imageChecked = false;
  videoChecked = false;
  audioChecked = false;
  textChecked = false;
  apiKey = 'AIzaSyDRxaUSTylptCTgX7-4e1Yfw4ynvIYJ7Mk';
  videoDetils: any;
  uploadFiles = [];
  loader: Loading;

  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private dataService: DataService,
    private authService: AuthService,
    private mediaCapture: MediaCapture,
    private toastCtrl: ToastController,
    private imagePicker: ImagePicker,
    private youtube: YoutubeVideoPlayer,
    private base64: Base64,
    public _DomSanitizer: DomSanitizer,
    private http: Http,
    private loadingCtrl: LoadingController) {
    this.authService.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
    })
    this.loader = this.loadingCtrl.create({
      content: 'Creating Survey'
    })
  }
  ngOnInit() {
    this.optionsData.push({ type: 'text', name: "", totalVotes: 0, id: "ID" + Math.random(), checked: false});
    this.commentsData.push({ name: "", totalVotes: 0, id: "ID" + Math.random(), checked: false })
    this.optionsDataCount = 1;
    this.commentsDataCount = 1;
  }

  showHideDateTime() {
    if (this.showDateTime == false) {
      this.showDateTime = true;
    }
    else {
      this.showDateTime = false;
    }
  }

  checkType(event) {
    if (event === "Comments") {
      this.typeSingle = false;
    }
    else {
      this.typeSingle = true;
    }
  }

  showAddMoreOptions() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select Input Type');

    alert.addInput({
      type: 'radio',
      label: 'Text/Link',
      value: "text",
      checked: this.textChecked
    });
    alert.addInput({
      type: 'radio',
      label: 'Image',
      value: 'image',
      checked: this.imageChecked
    });
    alert.addInput({
      type: 'radio',
      label: 'Audio',
      value: 'audio',
      checked: this.audioChecked
    });
    alert.addInput({
      type: 'radio',
      label: 'Video',
      value: 'video',
      checked: this.videoChecked
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.testRadioOpen = false;
        this.addMoreOption(data);
      }
    });
    alert.present();
  }
  addMoreOption(data) {
    if (data === "image") {
      this.optionsData.push({ type: 'image', imageUrl: "", totalVotes: 0, id: "ID" + Math.random(), checked: false})
      this.imageChecked = true;
      this.audioChecked = false;
      this.videoChecked = false;
      this.textChecked = false;
      this.optionsDataCount++;
    }
    else if (data === "audio") {
      this.optionsData.push({ type: 'audio', audioUrl: "", totalVotes: 0, id: "ID" + Math.random(), checked: false})
      this.audioChecked = true;
      this.imageChecked = false;
      this.videoChecked = false;
      this.textChecked = false;
      this.optionsDataCount++;
    }
    else if (data === "video") {
      this.optionsData.push({ type: 'video', videoId: "", totalVotes: 0, id: "ID" + Math.random(), checked: false})
      this.videoChecked = true;
      this.imageChecked = false;
      this.audioChecked = false;
      this.textChecked = false;
      this.optionsDataCount++;
    }
    else {
      if (this.typeSingle) {
        this.optionsData.push({ type: 'text', name: "", totalVotes: 0, id: "ID" + Math.random(), checked: false})
        this.optionsDataCount++;
        this.textChecked = true;
        this.imageChecked = false;
        this.audioChecked = false;
        this.videoChecked = false;
      } else {
        this.commentsData.push({ name: "", totalVotes: 0, id: "ID" + Math.random(), checked: false})
        this.commentsDataCount++;
      }
    }
  }

  onTakePicture(i) {
    let options: CaptureImageOptions;
    this.mediaCapture.captureImage(options)
      .then(
      (data: MediaFile[]) => {
        let filePath: string = data[0].fullPath;
        this.base64.encodeFile(filePath).then((base64File: string) => {
          console.log(base64File);
          this.optionsData[i].imageUrl = base64File;
          const toast = this.toastCtrl.create({
            message: 'Image Successfully Added',
            duration: 2000,
            position: 'bottom'
          })
          toast.present();
        }, (err) => {
          const toast = this.toastCtrl.create({
            message: err,
            duration: 2000,
            position: 'bottom'
          })
          toast.present();
        });
      },
      (err: CaptureError) => {
        const toast = this.toastCtrl.create({
          message: 'Error Adding Image',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
        console.error(err)
      });
  }
  onaddPicture(i) {
    let options = { maximumImagesCount: 1 }
    this.imagePicker.getPictures(options).then((result) => {
      if (result.length == 0) {
        return;
      }
      let filePath: string = result[0];
      this.base64.encodeFile(filePath).then((base64File: string) => {
        console.log(base64File);
        this.optionsData[i].imageUrl = base64File;
        const toast = this.toastCtrl.create({
          message: 'Image Successfully Added',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
      }, (err) => {
        const toast = this.toastCtrl.create({
          message: err,
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
      });
    }, (err) => {
      const toast = this.toastCtrl.create({
        message: 'Error Adding Image',
        duration: 2000,
        position: 'bottom'
      })
      toast.present();
    });
  }

  removeCommentsData(i) {
    if (this.commentsDataCount > 1) {
      this.commentsData.splice(i, 1);
      this.commentsDataCount--;
    } else {
      const toast = this.toastCtrl.create({
        message: 'Atleast one feilds are required for type Comments',
        duration: 2000,
        position: 'bottom'
      })
      toast.present();
    }
  }
  removeData(i) {
    if (this.optionsDataCount > 2) {
      let _id = this.optionsData[i].id;
      if (this.uploadFiles) {
        this.uploadFiles.map((data,index) => {
          if (data.id === _id) {
            this.uploadFiles.splice(index, 1)
          }
        })
      }
      this.optionsData.splice(i, 1);
      this.optionsDataCount--;
    } else {
      const toast = this.toastCtrl.create({
        message: 'Atleast two feilds are required for type Single/Multiple',
        duration: 2000,
        position: 'bottom'
      })
      toast.present();
    }
  }

  onStartAudioRecording(i) {
    let options: CaptureAudioOptions
    this.mediaCapture.captureAudio(options)
      .then(
      (data: MediaFile[]) => {
        let _id = this.optionsData[i].id;
        this.uploadFiles.map((data,index) => {
          if ( _id === data.id) {
            this.uploadFiles.splice(index,1)
          }
        })
        this.uploadFiles.push({ file: data[0], index: i, id: _id});
        this.optionsData[i].audioUrl = data[0].fullPath;
        const toast = this.toastCtrl.create({
          message: 'Recording Successfully Added',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
      },
      (err: CaptureError) => {
        const toast = this.toastCtrl.create({
          message: 'Error Adding Audio',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
        console.error(err)
      });
  }

  addYouTubeUrl(i) {
    const youtubeUrl = this.alertCtrl.create({
      title: 'Add YouTube Url',
      inputs: [
        {
          name: 'videoUrl',
          placeholder: 'Url'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: data => {
            const videoLink = this.youTubeGetID(data.videoUrl);
            if (data.videoUrl == null || videoLink === 'invalid') {
              const toast = this.toastCtrl.create({
                message: 'Please enter a valid url!',
                duration: 2000,
                position: 'bottom'
              })
              toast.present();
              return;
            }
            this.getVideoData(videoLink).subscribe(res => {
              this.videoDetils = res.json();
              console.log(this.videoDetils)
              this.optionsData[i].videoId = videoLink;
              this.optionsData[i].videoTitle = this.videoDetils.items[0].snippet.title;
              this.optionsData[i].videoThumbnail = this.videoDetils.items[0].snippet.thumbnails.standard.url;
            })
            const toast = this.toastCtrl.create({
              message: 'Youtube video link Added!',
              duration: 2000,
              position: 'bottom'
            })
            toast.present();
          }
        }
      ]
    })
    youtubeUrl.present();
  }

  getVideoData(Id) {
    return this.http.get('https://www.googleapis.com/youtube/v3/videos?key=' + this.apiKey + '&id=' + Id + '&part=snippet')
  }

  playVideo(videoId) {
    this.youtube.openVideo(videoId);
  }

  youTubeGetID(url) {
    let ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    }
    else {
      ID = "invalid";
    }
    return ID;
  }

  process(data) {
    var promise = new Promise((resolve, reject) => {
      let file = data.file;
      let index = data.i;
      let reader = new FileReader();
      file.end = file.size;
      reader.readAsArrayBuffer(file);
      reader.onloadend = (evt: any) => {

        var audioBlob = new Blob([evt.target.result], { type: 'audio/x-wav' });
        resolve(audioBlob);
      }
    })
    return promise
  }

  add(a: NgForm) {
    this.loader.present();
    this.survey.disabled = false;
    if (this.uploadFiles.length !== 0) {
      let audioCount = 0;
      this.uploadFiles.map(data => {
        let _id = data.id;
        this.process(data).then(newData => {
          this.dataService.uploadAudio(newData).then(snapshot => {
            this.optionsData.map((data,i) => {
              if(data.id === _id) {
                this.optionsData[i].audioUrl = snapshot.downloadURL;
              }
            })
            audioCount++;
            if (audioCount === this.uploadFiles.length) {
              this.submitSurvey();
            }
          })
        })
      })
    }
    else {
      this.submitSurvey();
    }
  }

  submitSurvey() {
    this.loader.dismiss();
    if (this.typeSingle) {
      let count = 0;
      let options = [];
      this.optionsData.map((data) => {
        if (typeof data.name !== typeof undefined) {
          if (data.name !== "") {
            count++;
            options.push(data);
          }
        }
        if (typeof data.imageUrl !== typeof undefined) {
          if (data.imageUrl !== "") {
            count++;
            options.push(data);
          }
        }
        if (typeof data.audioUrl !== typeof undefined) {
          if (data.audioUrl !== "") {
            count++;
            options.push(data);
          }
        }
        if (typeof data.videoId !== typeof undefined) {
          if (data.videoId !== "") {
            count++;
            options.push(data);
          }
        }
      })
      if (count >= 2) {
        if (this.showDateTime) {
          if (this.survey.surveyDate === undefined) {
            const toast = this.toastCtrl.create({
              message: 'Both the date and time feilds are required to set a valid date and time',
              duration: 2000,
              position: 'bottom'
            })
            toast.present();
            return
          }
          if (this.survey.surveyTime === undefined) {
            const toast = this.toastCtrl.create({
              message: 'Both the date and time feilds are required to set a valid date and time',
              duration: 2000,
              position: 'bottom'
            })
            toast.present();
            return
          }
        }
        else {
          delete this.survey.surveyDate;
          delete this.survey.surveyTime;
        }

        this.survey.surveyVotes = 0;
        this.survey.optionsData = options;
        delete this.survey.commentsData;
        this.survey.type = this.selectedOption;
        this.dataService.saveSurvey(this.authenticatedUser, this.survey);
        this.navCtrl.push('TabsPage');
      }
      else {
        const toast = this.toastCtrl.create({
          message: 'Atleast two feilds are required for type Single/Multiple',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
      }
    }
    else {
      let count = 0;
      let options = [];
      this.commentsData.map((data) => {
        if (typeof data.name !== typeof undefined) {
          if (data.name !== "") {
            count++;
            options.push(data);
          }
        }
      })
      if (count >= 1) {
        this.survey.surveyVotes = 0;
        this.survey.commentsData = options;
        this.survey.type = this.selectedOption;
        delete this.survey.optionsData
        this.dataService.saveSurvey(this.authenticatedUser, this.survey);
        this.navCtrl.push('TabsPage');
      }
      else {
        const toast = this.toastCtrl.create({
          message: 'Atleast one feild is required for type Comments',
          duration: 2000,
          position: 'bottom'
        })
        toast.present();
      }
    }
    console.log(this.survey);
  }
}