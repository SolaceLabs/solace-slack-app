ehco "SLACK_SIGNING_SECRET=" > .env
ehco "SLACK_BOT_TOKEN=" >> .env
ehco "APP_TOKEN=" >> .env
ehco "PORT=4000" >> .env
echo "{}" > tokens.json
