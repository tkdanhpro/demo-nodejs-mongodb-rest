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
  const [username, email, fullName] = names;

  const keywordUsername = createKeywords(`${username}`);
  const keywordEmail = createKeywords(`${email}`);
  const keywordFullName = createKeywords(`${fullName}`);
  
  
  return [
    ...new Set([
      ...keywordUsername,
      ...keywordEmail,
      ...keywordFullName
    ])
  ];
}

module.exports = generateKeywords
