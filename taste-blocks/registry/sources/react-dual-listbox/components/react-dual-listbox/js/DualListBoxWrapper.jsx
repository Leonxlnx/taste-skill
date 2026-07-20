import memoize from 'lodash/memoize.js';
import PropTypes from 'prop-types';
import React from 'react';

import ObjectValueWrapper from './components/ObjectValueWrapper.jsx';
import DualListBox, {
    propTypes as mainPropTypes,
    defaultProps as mainDefaults,
} from './components/DualListBox.jsx';
import defaultLang from './lang/default.js';
import iconsShape from './shapes/iconsShape.js';
import languageShape from './shapes/languageShape.js';
import { IconContext, LanguageContext } from './contexts.js';

const wrapperPropTypes = {
    icons: iconsShape,
    lang: languageShape,
    simpleValue: PropTypes.bool,
};

const defaultIcons = {
    moveToAvailable: <span className="rdl-icon rdl-icon-move-to-available" />,
    moveAllToAvailable: <span className="rdl-icon rdl-icon-move-all-to-available" />,
    moveToSelected: <span className="rdl-icon rdl-icon-move-to-selected" />,
    moveAllToSelected: <span className="rdl-icon rdl-icon-move-all-to-selected" />,
    moveBottom: <span className="rdl-icon rdl-icon-move-bottom" />,
    moveDown: <span className="rdl-icon rdl-icon-move-down" />,
    moveUp: <span className="rdl-icon rdl-icon-move-up" />,
    moveTop: <span className="rdl-icon rdl-icon-move-top" />,
};

const combineMemoized = memoize((newValue, defaultValue) => ({ ...defaultValue, ...newValue }));

function DualListBoxWrapper({
    icons = defaultIcons,
    lang = defaultLang,
    simpleValue = true,
    ...otherProps
}) {
    // Merge any language or icon changes with the default
    const mergedLang = combineMemoized(lang, defaultLang);
    const mergedIcons = combineMemoized(icons, defaultIcons);

    // Select the dual listbox that aligns to the `simpleValue` setting
    const ListBoxType = !simpleValue ? ObjectValueWrapper : DualListBox;

    // Set the defaults for the main listbox properties
    const mainProps = { ...mainDefaults, ...otherProps };

    /* eslint-disable react/jsx-props-no-spreading */
    return (
        <LanguageContext.Provider value={mergedLang}>
            <IconContext.Provider value={mergedIcons}>
                <ListBoxType {...mainProps} />
            </IconContext.Provider>
        </LanguageContext.Provider>
    );
    /* eslint-enable */
}

DualListBoxWrapper.propTypes = { ...wrapperPropTypes, ...mainPropTypes };

export default DualListBoxWrapper;
