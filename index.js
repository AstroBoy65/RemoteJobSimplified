import express from "express";
import axios from "axios";
import he from "he";
import bodyParser from "body-parser";

const app = express();
const API_URL = "https://jobicy.com/api/v2/remote-jobs";
const API_URL2 = "https://jobicy.com/api/v2/remote-jobs?get=industries";
const API_URL3 = "https://jobicy.com/api/v2/remote-jobs?get=locations";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index.ejs'); 
});

app.get('/home', (req, res) => {
    res.render('index.ejs');
});

app.get('/about', (req, res) => {
    res.render('partials/about.ejs');
});

app.get('/JobSearch', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 

        const result = await axios.get(API_URL);
        const response = await axios.get(API_URL2);
        const told = await axios.get(API_URL3);

        const formattedJobs = result.data.jobs.map(job => ({
            id: job.id,
            url: job.url,
            jobTitle: job.jobTitle,
            companyName: job.companyName,
            companyLogo: job.companyLogo,
            jobIndustry: job.jobIndustry,
            jobType: job.jobType,
            jobGeo: job.jobGeo,
            jobExcerpt: he.decode(job.jobExcerpt),
        }));

        const uniqueGeos = [...new Set(told.data.locations.map(location => he.decode(location.geoName)))];
        const uniqueIndustry = [...new Set(response.data.industries.map(industry => he.decode(industry.industrySlug)))];
        

        
        const totalJobs = result.data.jobs.length;
        const totalPages = Math.ceil(totalJobs / limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const jobsOnPage = formattedJobs.slice(startIndex, endIndex);
        
        res.render("partials/JobSearch.ejs", { 
            jobs: jobsOnPage,
            totalPages: totalPages,
            currentPage: page,
            uniqueGeos: uniqueGeos,
            uniqueIndustry: uniqueIndustry,
        });
        
    } catch (error) {
        console.log(error.response);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/get-job', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 

        const lookUp = req.body.inputSearch;
        const place = req.body.inputRegion.toLowerCase().replace(/\s/g, "");
        const work = req.body.inputCategory;
        const type = req.body.inputJobType.toLowerCase().replace(/\s/g, "");
        const more = req.body.inputMore;

        
        const response = await axios.get(API_URL2);
        const told = await axios.get(API_URL3);

        let apiUrl = `${API_URL}?`;

        if (place === "region") {
            
        } else {
            apiUrl += `geo=${place}&`;
        }


        if (work === "category") {
            
        } else {
            apiUrl += `industry=${work}&`;
        }
        if (lookUp === "") {
            
        } else {
            apiUrl += `tag=${lookUp}&`;
        }


        if (more === "Past 3 days") {
            apiUrl += `count=3&`;
        } else {}

        if (apiUrl.endsWith('&')) {
            apiUrl = apiUrl.slice(0, -1);
        }

        let apiUrl2 = await axios.get(apiUrl);

        const formattedJobs = apiUrl2.data.jobs.map(job => ({
            id: job.id,
            url: job.url,
            jobTitle: job.jobTitle,
            companyName: job.companyName,
            companyLogo: job.companyLogo,
            jobIndustry: job.jobIndustry,
            jobType: job.jobType,
            jobGeo: job.jobGeo,
            jobExcerpt: he.decode(job.jobExcerpt),
        }));

        const uniqueGeos = [...new Set(told.data.locations.map(location => he.decode(location.geoName)))];
        const uniqueIndustry = [...new Set(response.data.industries.map(industry => he.decode(industry.industrySlug)))];
        
        
        

        const totalJobs = apiUrl2.data.jobs.length;
        const totalPages = Math.ceil(totalJobs / limit);
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const jobsOnPage = formattedJobs.slice(startIndex, endIndex);
        
        res.render("partials/JobSearch.ejs", { 
            jobs: jobsOnPage,
            totalPages: totalPages,
            currentPage: page,
            uniqueGeos: uniqueGeos,
            uniqueIndustry: uniqueIndustry,
        });
        
        
        
    } catch (error) {
        console.log(error.response);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log('port 3k is active');
});
