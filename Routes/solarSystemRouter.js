const express = require("express")
const router = express.Router()
const axios = require("axios")
const apiURL = "https://api.le-systeme-solaire.net/rest/bodies"

async function filterPlanets(data) { return data.bodies.filter(x => x.isPlanet == true) } 

router.get('/', async (req, res) => {
    try {
        var response = []
        const result = await axios.get(apiURL)
        const planets = await filterPlanets(result.data)
        planets.map( async x => {
            var testJson = {
                name: x.englishName,
                moons: x.moons,
                gravity: x.gravity,
                discoveredBy: x.discoveredBy,
                discoveryDate: x.discoveryDate,
                avgTemp: x.avgTemp
            }
            response.push(testJson)
        })
        await Promise.all(response)
        res.status(200).send({results: response, total: response.length})
    } catch (error) {
        res.status(500)
    }    
})

router.get('/all', async (req, res) => {
    try {
        const result = await axios.get(apiURL)
        res.json(result.data)
    } catch (error) {
        res.status(500)
    }
})

router.get('/:name', getPlanet, getMoons, async (req, res) => {
    try {
        const response = {
            name: res.planet.englishName,
            moons: res.moons,
            gravity: res.planet.gravity,
            discoveredBy: res.planet.discoveredBy,
            discoveryDate: res.planet.discoveryDate,
            avgTemp: res.planet.avgTemp
        }
        res.send(response)
    } catch (error) {
        res.status(500)
    }
})

async function getPlanet(req, res, next){
    try {
        const result = await axios.get(apiURL)
        const planet = result.data.bodies.filter(x => x.englishName == req.params.name.capitalize())
        if (planet.length == 0) {
            return res.status(404).json({statusCode: 404, message: "Planet not found"})
        }
        res.planet = planet[0]
    } catch (error) {   
        res.status(500)
    }
    next()
}

async function getMoons(req, res, next) {
    const resPlanet = res.planet.moons
    if (resPlanet == null) {
        res.moons = []    
        next()
        return
    }
    const rels = resPlanet.map(x => x.rel)
    const moons = await getEachMoon(rels)
    console.log(moons)
    res.moons = moons
    next()
}

async function getEachMoon(rels) {
    var moonsData = []
    const moons = rels.map( async rel => {
        const result = await axios.get(rel)
        moonsData.push(result.data)
    })
    await Promise.all(moons)
    return moonsData.map(x => x.englishName) 
}

module.exports = router

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});
