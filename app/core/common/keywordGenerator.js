//https://medium.com/@ken11zer01/firebase-firestore-text-search-and-pagination-91a0df8131ef

const createKeywords = name => {
    const arrName = [];
    let curName = '';
    name.split('').forEach(letter => {
      curName += letter;
      arrName.push(curName);
    });
    return arrName;
  }
  
  
  const generateKeywords = names => {
    const [username, id] = names;

    //const keywordByUserId = createKeywords(`${id}`);
    //const keywordByUsername = createKeywords(`${username}`);
    
    return [
      ...new Set([
        '',
        id,
        username
      ])
    ];
  }

  module.exports = generateKeywords
  