const mongo = require("mongodb");
const DBService = require("./DBService");
const UtilsService = require("./UtilsService")
var builder = require("xmlbuilder");

const MAX_ITEMS = 5000;  // test can be done by changing to 1000
const FILE_BASE_NAME = "list";


function getlists() {
    return new Promise((resolve, reject) => {
      DBService.dbConnect().then(db => {
        db
          .collection("lists")
          .find({
            $and: [
              { isActive: true },
              { exposure: "public" },
              { status: "published" }
            ]
          })
          .toArray((err, lists) => {
            if (err) reject(err);
            else resolve(lists);
            db.close();
          });
      });
    });
  }
  
  function createXmlList() {
    getlists().then(lists => {
      if (lists.length < MAX_ITEMS) {
        createUrlSet(lists, 1);
      } else {
        let chunkedlists = UtilsService.chunkArray(lists, MAX_ITEMS);
        createSitemapindex(chunkedlists);
  
        chunkedlists.forEach((lists, i) => {
          createUrlSet(lists, i + 1);
        });
      }
    });
  }
  
  function createUrlSet(lists, urlsetNum) {
    var listObj = {
      urlset: {
        "@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:schemaLocation":
          "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd",
        url: []
      }
    };
  
    lists.forEach(list => {
      let url = `http://domain.com/list/${list._id}`;
  
      listObj.urlset.url.push({
        loc: {
          "@rel": "alternate",
          "@type": "text/html",
          "@href": url
        },
        lastMod: list.lastUpdate.toString()
      });
    });
    let xmlList = builder.create(listObj, { encoding: "utf-8" });
    let fileName = `${FILE_BASE_NAME}/sitemap-${urlsetNum}.xml`;
    UtilsService.saveFile(fileName, xmlList.end({ pretty: true }));
  };



  
  function createSitemapindex(chunkedlists) {
    var listObj = {
      sitemapindex: {
        "@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        sitemap: []
      }
    };
    chunkedlists.forEach((lists, i) => {
      let url = `http://domain.com/list/sitemap-${i}`;
  
      listObj.sitemapindex.sitemap.push({
        loc: {
          "@rel": "alternate",
          "@type": "text/html",
          "@href": url
        }
      });
    });
    let xmlList = builder.create(listObj, { encoding: "utf-8" });
    let fileName = FILE_BASE_NAME + "/sitemapindex.xml";
  
    UtilsService.saveFile(fileName, xmlList.end({ pretty: true }));
  };




  module.exports = {
    createXmlList
}