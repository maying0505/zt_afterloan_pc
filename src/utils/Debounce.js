import debounce from 'lodash.debounce';

function LodashDebounce(func) {
    return debounce(func, 1000, {leading: true, trailing: false});
}

export default LodashDebounce;
