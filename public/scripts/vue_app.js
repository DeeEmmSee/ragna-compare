const RagnaApp = {
    name: 'RagnarockApp',
    data() {
        return {
            Test: "Hello world!",
            myName: "",
            theirName: "",
            myScores: [],
            theirScores: [],
            myComparedScores: [],
            myScoresObj: {},
            theirScoresObj: {},
            myTotalPages: 0,
            theirTotalPages: 0,
        }
    },
    methods: {
        CompareScores() {
            if (this.myName == "" || this.theirName == "") {
                return;
            }

            this.myScores = [];
            this.theirScores = [];
            this.myComparedScores = [];

            this.myScoresObj = {};
            this.theirScoresObj = {};

            // Get 1st page
            this.GetWebPage(this.myName, 1, true);
            this.GetWebPage(this.theirName, 1, false);
            
            /*var MyHtml = $.parseHTML(myPage);
            var TheirHtml = $.parseHTML(theirPage);
    
            // Get pagination
            var myPages = MyHtml.getElementsByClassName("pagination")[0].getElementsByTagName("a");//[3].innerText;
            var theirPages = TheirHtml.getElementsByClassName("pagination")[0].getElementsByTagName("a");//[3].innerText;
            var myTotalPages = Number(myPages[myPages.length - 1]);
            var theirTotalPages = Number(theirPages[theirPages.length - 1]);
            
            var myTable = MyHtml.getElementsByTagName("table")[0];
            var theirTable = TheirHtml.getElementsByTagName("table")[0];

            this.GetScores(myTable[0].getElementsByTagName("tr"), myScoresObj);
            this.GetScores(theirTable[0].getElementsByTagName("tr"), theirScoresObj);*/

            // Get other pages
            //for (var i = 1; i < this.myTotalPages; i++) {
                //this.GetWebPage(this.myName, i, true);
            //}

            //for (var i = 1; i < this.theirTotalPages; i++) {
                //this.GetWebPage(this.theirName, i, false);
            //}            

        },
        GetWebPage(username, pagenum, useMyScore) {
            var app = this;

            axios.get('https://ragnacustoms.com/user-profile/' + username + '?order_by=score&order_sort=desc&ppage1=' + pagenum)
            //axios.get('https://ragnacustoms.com/user-profile/DeeEmmSee?order_by=score&order_sort=desc&ppage1=1')
            .then(function(res) {
                //console.log(res.data.substr(15));
                var MyHtml = $.parseHTML(res.data.substr(15));  
                var mainDiv = null;
                for (var i = 0; i < MyHtml.length; i++) {
                    if (MyHtml[i].id == "main") {
                        mainDiv = MyHtml[i];
                        break;
                    }
                }

                if (mainDiv != null) {
                    var myTable = mainDiv.getElementsByTagName("table")[0];
                    var rows = myTable.getElementsByTagName("tr");
                    var pages = mainDiv.getElementsByClassName("pagination")[0].getElementsByTagName("a");//[3].innerText;
                    var totalPages = 1; //Number(pages[pages.length - 1]);

                    if (pages.length == 2) {
                        totalPages = 1;
                    }
                    else if (pages.length == 3) {
                        totalPages = 2;
                    }
                    else if (pages.length == 4) {
                        totalPages = 3;
                    }
                    else if (pages.length == 5) {
                        totalPages = pages[3].innerText;
                    }

                    if (useMyScore) {
                        app.GetScores(rows, app.myScoresObj);
                        // if (pagenum == 1 && totalPages > 1) {
                        //     for (var i = 1; i < totalPages; i++) {
                        //         app.GetWebPage(username, i, useMyScore);
                        //     }
                        // }
                    }
                    else {
                        app.GetScores(rows, app.theirScoresObj);
                    }

                    if (pagenum == 1 && totalPages > 1) {
                        for (var i = 2; i <= totalPages; i++) {
                            app.GetWebPage(username, i, useMyScore);
                        }   
                    }

                    app.RecalculateComparison();
                }
            })
            .catch(function(err) {
                console.log(err);
            });
        },
        GetScores(rows, scoresObj) {
            //var scores = {};

            // 1st row is header
            for (var i = 1; i <= 15; i++) {
                var row = rows[i];

                var url = row.getElementsByTagName("a")[0].href;
                var diff = row.getElementsByTagName("td")[1].getElementsByTagName("span")[0].innerText;
                var key = url.substr(url.lastIndexOf('/') + 1) + "_" + diff;

                var title = row.getElementsByClassName("title")[0].innerText;
                var author = row.getElementsByClassName("author")[0].innerText;
                
                var distance = row.getElementsByTagName("td")[2].innerText;
                
                var pp = row.getElementsByTagName("td")[3].innerText;
                var rawPP = '0';
                var weightedPP = '0';

                if (pp != '') {
                    var tmpPP = pp.split(" ");
                    rawPP = tmpPP[0];
                    weightedPP = tmpPP[1];
                }
                
                //var rawPP = row.getElementsByTagName("td")[3].innerText;
                //var weightedPP = row.getElementsByTagName("td")[3].getElementsByTagName("small").innerText;

                var scoreObj = {
                    title: title,
                    author: author.replace("\n", ""),
                    diff: diff,
                    distance: distance.replace("\n", "").replace("\n", ""),
                    rawPP: rawPP.replace("\n", ""),
                    weightedPP: weightedPP.replace("\n", "")
                };

                scoresObj[key] = scoreObj;

                // console.log(title);
                // console.log(author);
                // console.log(distance);
                // console.log(rawPP);
                // console.log(weightedPP);
                // console.log("\r\n");
            }
        },
        RecalculateComparison() {
            this.myComparedScores = [];

            // Aggregate
            for (const [key, value] of Object.entries(this.myScoresObj)) {
                if (key in this.theirScoresObj) {
                    this.myScores.push(this.myScoresObj[key]);
                    this.theirScores.push(this.theirScoresObj[key]);

                    var comparedScore = this.myScoresObj[key];
                    comparedScore.theirDistance = this.theirScoresObj[key].distance;
                    comparedScore.distanceDiff = Number(this.myScoresObj[key].distance - this.theirScoresObj[key].distance);

                    comparedScore.theirRawPP = this.theirScoresObj[key].rawPP;
                    comparedScore.rawPPDiff = Number(this.myScoresObj[key].rawPP - this.theirScoresObj[key].rawPP);
                    this.myComparedScores.push(comparedScore);
                }
            }

            // Reorder
            this.myComparedScores.sort((a,b) => a.rawPPDiff - b.rawPPDiff);
        }
    },
    mounted() {
        // var MyHtml = $.parseHTML(myTestHTML);
        // var TheirHtml = $.parseHTML(theirTestHTML);

        // var myScores = this.GetScores(MyHtml[0].getElementsByTagName("tr"));
        // var theirScores = this.GetScores(TheirHtml[0].getElementsByTagName("tr"));

        // for (const [key, value] of Object.entries(myScores)) {
        //     if (key in theirScores) {
        //         console.log(myScores[key]);
        //         console.log(theirScores[key]);
        //     }
        // }

        //console.log(myScores);
        //console.log(theirScores);
    }
};

Vue.createApp(RagnaApp).mount('#app');