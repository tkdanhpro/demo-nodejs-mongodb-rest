
module.exports = {
    asyncForEach: async (array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    
    convertTimeStampToDate: data => {
        data.updated_at = data.updated_at !== undefined ? data.updated_at.toDate() : new Date()
        data.created_at = data.created_at !== undefined ? data.created_at.toDate() : new Date()
    },
    
    getData: snapshot => {
        let doc;
        snapshot.forEach(d => {
            doc = d
        })
        let data = doc.data()
        // data.id = doc.id
        return data
    }
}