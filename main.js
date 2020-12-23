const {Builder, By, Key, until} = require('selenium-webdriver');
const $ = require('jquery')
const { parse } = require('node-html-parser');

// (async function example() {
//   let driver = await new Builder().forBrowser('firefox').build();
//   try {
//     await driver.get('http://www.google.com/ncr');
//     await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//     await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
//   } finally {
//     await driver.quit();
//   }
// })();


function print_out(a) {
    console.log(a)
}


class FakeBulk {

    constructor(username, password) {
        this.checkpoint = false
        this.driver = new Builder().forBrowser('firefox').build()
        this.username = username
        this.password = password
    }

    async login () {
        await this.driver
        await this.driver.get("https://mbasic.facebook.com")
        await this.driver.findElement(By.id("m_login_email")).sendKeys(this.username)
        await this.driver.findElement(By.name('pass')).sendKeys(this.password, Key.RETURN)
        await this.driver.wait(until.urlContains('_rdr'), 10000)
        let current_url = await this.driver.getCurrentUrl()
        console.log(current_url)
        if (current_url.includes('checkpoint')) {
            this.checkpoint = true
        }
    }

    async getAllGroup() {
        if (this.checkpoint)
            return
        
        await this.driver
        await this.driver.get("https://mbasic.facebook.com/groups/?seemore")
        const doc = await this.driver.getPageSource()


        const root = parse(doc)
        const allLinks = root.querySelectorAll('a')

        const result = []
        for (let i=0; i < allLinks.length; i++) {
            const link = allLinks[i]
            const attr = link.rawAttrs
            const pattern = /.+?\/groups\/(\w+?)\//g
            const match = pattern.exec(attr)
            if (match === null || !match[1])
                continue
            const id = match[1]
            result.push({
                name: link.text,
                id: id
            })
        }
        return result
    }

    async writeMessageInGroup(groupId, message) {
        const url = "https://mbasic.facebook.com/groups/" + groupId

        await this.driver
        await this.driver.get(url)

        await this.driver.findElement(By.css("#mbasic-composer-form textarea[name='xc_message']")).sendKeys(message)
        await this.driver.findElement(By.css("input[name='view_post']")).click()

    }

    async writeMessageInGroups(groupIds, message) {
        const defs = groupIds.map(gid => {
            return () => this.writeMessageInGroup(gid, message) 
        })

        await defs.reduce((pre, cur) => {
            if (pre) 
                return pre.then(cur)
            return cur()
        }, false);
    }

    async quit() {
        await this.driver
        await this.driver.quit()
    }

}

(async () => {
    let fb = new FakeBulk('tienhieud', 'uhujuhjjjkh')
    await fb.login()
    // const groups = await fb.getAllGroup()
    const groups = ["171891003329937", "1557898377873005"]
    await fb.writeMessageInGroups(groups, "test1\nhello em ten gi chu ko phai thinh dau\n co ban trai chua de do tinh sau")
    await fb.quit()
})();