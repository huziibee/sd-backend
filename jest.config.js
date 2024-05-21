module.exports = {
    collectCoverage: true,
    coverageReporters: ['text', 'cobertura'],

    // jest.config.json


    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
  }
  
