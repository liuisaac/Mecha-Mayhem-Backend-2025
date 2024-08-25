const admin = require("firebase-admin");
const { db } = require("../../config/firebaseConfig");

// function that records match data for OPR/DPR/CWM calculations
async function calcMatch(year, division, matchString) {
    const docRef = db.doc(`calc/${year}/${division}/matches`);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
        // document does not exist
        await docRef.set({
            matches: [matchString],
        });
        console.log('Folder created and match string added to Firestore.');
    } else {
        // document exists, update it
        const matches = docSnapshot.data().matches;

        if (!matches.some(match => match === matchString)) {
            await docRef.update({
                matches: admin.firestore.FieldValue.arrayUnion(matchString),
            });
            console.log('Match string added to Firestore.');
        }
    }
}

module.exports = { calcMatch };