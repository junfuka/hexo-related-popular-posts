const { google } = require('googleapis')
const dr = require('./dateRange.js')
const util = require('./util.js')
const lg = require('./log.js')

module.exports = (inHexo) => {
  const jwtClient = new google.auth.JWT(inHexo.config.popularPosts.tmp.email,
    null,
    inHexo.config.popularPosts.tmp.key,
    ['https://www.googleapis.com/auth/analytics.readonly'],
    null)
  const analytics = google.analytics('v3')

  const getTotalPVfromGA = isUpdated => {
    return new Promise((resolve, reject) => {
      // load google analytics data
      if (inHexo.config.popularPosts.tmp.isGaUpdate) {
        if (inHexo.config.popularPosts.tmp.id && inHexo.config.popularPosts.tmp.email && inHexo.config.popularPosts.tmp.key && inHexo.config.popularPosts.tmp.viewId && inHexo.config.popularPosts.tmp.pvMeasurementsStartDate !== '') {
          jwtClient.authorize(err => {
            if (err) {
              lg.log('error', err)
              reject()
            }
            analytics.data.ga.get({
              'auth': jwtClient,
              'ids': 'ga:' + inHexo.config.popularPosts.tmp.viewId,
              'start-date': inHexo.config.popularPosts.tmp.pvMeasurementsStartDate,
              'end-date': dr.getYesterdayDateStr(),
              'metrics': 'ga:pageviews',
              'dimensions': 'ga:pagePath',
              'sort': '-ga:pageviews',
            }, (err, { data }) => {
              if (err) {
                lg.log('error', '(ga-analytics totalPV error) ' + err + '\nPlease check the Google AnalyticsAPI Options or Environment Variables.', '_config.yml', true)
                resolve()
              } else {
                if (data.rows && data.rows.length > 0) {
                  for (let i = 0; i < data.rows.length; i++) {
                    for (let k = 0; k < inHexo.config.popularPosts.tmp.gaData.length; k++) {
                      if (inHexo.config.popularPosts.tmp.gaData[k].path === util.normalizeURL(data.rows[i][0])) {
                        inHexo.config.popularPosts.tmp.gaData[k].totalPV = inHexo.config.popularPosts.tmp.gaData[k].totalPV + Number(data.rows[i][1])
                        break
                      }
                    }
                  }
                }

                const gaDataTmp = inHexo.config.popularPosts.tmp.gaData

                util.orverrideTmp(gaDataTmp, inHexo)

                resolve(true)
              }
            })
          })
        } else {
          resolve(isUpdated)
        }
      } else {
        resolve(isUpdated)
      }
    })
  }

  const getPVfromGA = () => {
    return new Promise(resolve => {
      let gaData

      // load google analytics data
      if (inHexo.config.popularPosts.tmp.isGaUpdate) {
        if (inHexo.config.popularPosts.tmp.id && inHexo.config.popularPosts.tmp.email && inHexo.config.popularPosts.tmp.key && inHexo.config.popularPosts.tmp.viewId) {
          jwtClient.authorize(err => {
            if (err) {
              lg.log('error', err)
              resolve()
            }
            analytics.data.ga.get({
              'auth': jwtClient,
              'ids': 'ga:' + inHexo.config.popularPosts.tmp.viewId,
              'start-date': inHexo.config.popularPosts.tmp.startDate,
              'end-date': inHexo.config.popularPosts.tmp.endDate,
              'metrics': 'ga:pageviews',
              'dimensions': 'ga:pagePath',
              'sort': '-ga:pageviews',
            }, (err, { data }) => {
              if (err) {
                lg.log('error', '(ga-analytics pv error) ' + err + '\nPlease check the Google AnalyticsAPI Options or Environment Variables.', '_config.yml', true)
                resolve()
              } else {
                const ndt = new Date().getTime()
                gaData = [{ 'cachedDate': ndt, 'gaData': [] }]
                if (data.rows && data.rows.length > 0) {
                  for (let i = 0; i < data.rows.length; i++) {
                    let isAlreadyCreated = false
                    for (let k = 0; k < inHexo.config.popularPosts.tmp.gaData.length; k++) {
                      if (inHexo.config.popularPosts.tmp.gaData[k].path === util.normalizeURL(data.rows[i][0])) {
                        gaData[0].gaData.push(util.gaDataModel({
                          'updated': inHexo.config.popularPosts.tmp.gaData[k].updated || '0',
                          'title': inHexo.config.popularPosts.tmp.gaData[k].title || '',
                          'path': data.rows[i][0],
                          'eyeCatchImage': inHexo.config.popularPosts.tmp.gaData[k].eyeCatchImage || '',
                          'excerpt': inHexo.config.popularPosts.tmp.gaData[k].excerpt || '',
                          'date': inHexo.config.popularPosts.tmp.gaData[k].date || '',
                          'pv': Number(data.rows[i][1]),
                          'totalPV': 0,
                          'categories': inHexo.config.popularPosts.tmp.gaData[k].categories || [],
                          'tags': inHexo.config.popularPosts.tmp.gaData[k].tags || [],
                          'internalLinks': inHexo.config.popularPosts.tmp.gaData[k].internalLinks || [],
                          'keywords': inHexo.config.popularPosts.tmp.gaData[k].keywords || [],
                          'keywordsLength': inHexo.config.popularPosts.tmp.gaData[k].keywordsLength || 0,
                        }))

                        isAlreadyCreated = true
                        break
                      }
                    }

                    if (!isAlreadyCreated) {
                      gaData[0].gaData.push(util.gaDataModel({
                        'path': data.rows[i][0],
                        'pv': Number(data.rows[i][1]),
                      }))
                    }
                  }
                }

                // Adding a page without access.
                for (let k = 0; k < inHexo.config.popularPosts.tmp.gaData.length; k++) {
                  let isNotMatch = true
                  if (data.rows && data.rows.length > 0) {
                    for (let i = 0; i < data.rows.length; i++) {
                      if (inHexo.config.popularPosts.tmp.gaData[k].path === util.normalizeURL(data.rows[i][0])) {
                        isNotMatch = false
                      }
                    }
                  }
                  if (isNotMatch) {
                    gaData[0].gaData.push(inHexo.config.popularPosts.tmp.gaData[k])
                  }
                }

                // normalized URL
                const gaData_temp = util.normalizeGaData(gaData[0].gaData)
                gaData[0].gaData = null
                gaData[0].gaData = gaData_temp


                util.orverrideTmp(gaData[0].gaData, inHexo)


                resolve(true)
              }
            })
          })
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  }

  return getPVfromGA()
    .then(getTotalPVfromGA)
    .then(isUpdated => {
      if (isUpdated) lg.log('info', 'Google Analytics Page View Data was refreshed.', null, false)
    })
}

