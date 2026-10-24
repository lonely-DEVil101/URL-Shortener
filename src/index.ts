import express from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.set("view engine", "ejs")

type UrlEntry = {
    originalUrl: string;
    createdAt: Date;
    clicks: number;
}


const UrlMap = new Map<string, UrlEntry>()

const urlSchema = z.object({originalUrl: z.url()})

app.get('/', (req, res) => {
    res.render("index", {error: null})
})

app.post('/shorten', (req, res) => {
    const result = urlSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "invalid input",
            error: result.error.issues
        })
    }
    const validUrl = result.data.originalUrl;
    const nanoUrl = urlShortener(validUrl);
    res.json({shortUrl: `${req.protocol}://${req.host}/${nanoUrl}`})
})

app.post('/shorten-form', (req, res) => {
    const result = urlSchema.safeParse(req.body)

    if(!result.success){
        return `Wrong input type. Try again.`
    }
    const validUrl = result.data.originalUrl;
    const nanoUrl= urlShortener(validUrl)
    res.render("result", {shortUrl: `${req.protocol}://${req.host}/${nanoUrl}`})    
})

function urlShortener(originalUrl: string){
    const newUrl : UrlEntry = {
        originalUrl,
        createdAt: new Date(),
        clicks: 0
    }

    

    
    let nanoUrl = nanoid(8);

    while(UrlMap.has(nanoUrl)) {
        nanoUrl = nanoid(8)
    }

    UrlMap.set(nanoUrl, newUrl);
    return nanoUrl;
}

app.get('/:code', (req,res) => {
    const urlObject = UrlMap.get(req.params.code);
    
    if(urlObject) {
        const originalUrl = urlObject.originalUrl;
        urlObject.clicks++;
        res.redirect(302, originalUrl);
    } else {
        return res.status(404).json({
            status: 404,
            message: "Sorry, this route does not exist"
        })
    }
})

app.listen(3000, () => console.log('URL Shortener Active'))