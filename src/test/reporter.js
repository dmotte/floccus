export function createWebdriverAndHtmlReporter(html_reporter) {
  return function(runner) {
    Mocha.reporters.Base.call(this, runner)
    new html_reporter(runner)

    // Scroll down test display after each test
    let mocha = document.querySelector('#mocha')
    runner.on('test', test => {
      console.log('\n### ' + test.title + ' ###\n')
      killTimeout = setTimeout(() => {
        console.log(
          'FINISHED FAILED - no test has ended for 3 minutes, tests stopped'
        )
      }, 60000 * 3)
      mocha.scrollTop = mocha.scrollHeight
    })

    runner.on('suite', suite => {
      if (suite.root) return
      console.log('\n## ' + suite.title + ' ## \n')
    })

    var killTimeout
    runner.on('test end', test => {
      if ('passed' == test.state) {
        console.log('->', 'PASSED :', test.title)
      } else if (test.pending) {
        console.log('->', 'PENDING:', test.title)
      } else {
        console.log('->', 'FAILED :', test.title, stringifyException(test.err))
      }

      if (killTimeout) clearTimeout(killTimeout)
    })
    runner.on('run end', () => {
      var minutes = Math.floor(runner.stats.duration / 1000 / 60)
      var seconds = Math.round((runner.stats.duration / 1000) % 60)

      console.log(
        'FINISHED ' + (runner.stats.failures > 0 ? 'FAILED' : 'PASSED') + ' -',
        runner.stats.passes,
        'tests passed,',
        runner.stats.failures,
        'tests failed, duration: ' + minutes + ':' + seconds
      )
    })
  }
}

function stringifyException(exception) {
  var err = exception.stack || exception.toString()

  // FF / Opera do not add the message
  if (!~err.indexOf(exception.message)) {
    err = exception.message + '\n' + err
  }

  // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we
  // check for the result of the stringifying.
  if ('[object Error]' == err) err = exception.message

  // Safari doesn't give you a stack. Let's at least provide a source line.
  if (!exception.stack && exception.sourceURL && exception.line !== undefined) {
    err += '\n(' + exception.sourceURL + ':' + exception.line + ')'
  }

  return err
}
