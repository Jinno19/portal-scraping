let cover = "naked";

const JSON_EXPRESSION = {
    type: (cover),
    altText: "this is a carousel template",
    template: {
        type: "carousel",
        columns: [
            {
              thumbnailImageUrl: "https://example.com/bot/images/item1.jpg",
              imageBackgroundColor: "#FFFFFF",
              title: (cover),
              text: "description",
              defaultAction: {
                  type: "uri",
                  label: "View detail",
                  uri: "http://example.com/page/123"
              },
              actions: [
                  {
                      type: "postback",
                      label: "Buy",
                      data: "action=buy&itemid=111"
                  },
                  {
                      type: "postback",
                      label: "Add to cart",
                      data: "action=add&itemid=111"
                  },
                  {
                      type: "uri",
                      label: "View detail",
                      uri: "http://example.com/page/111"
                  }
              ]
            }
        ],
        imageAspectRatio: "rectangle",
        imageSize: "cover"
    }
  }

console.log(JSON_EXPRESSION);
const trueJSON = JSON.stringify(JSON_EXPRESSION);
console.log(trueJSON);

console.log(process.argv);