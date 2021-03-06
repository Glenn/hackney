.x-form-file-wrap {
    position: relative;
    height: 22px;
}
.x-form-file-wrap .x-form-file {
	position: absolute;
	right: 0;
	-moz-opacity: 0;
	filter:alpha(opacity: 0);
	opacity: 0;
	z-index: 2;
    height: 22px;
}
.x-form-file-wrap .x-form-file-btn {
	position: absolute;
	right: 0;
	z-index: 1;
}
.x-form-file-wrap .x-form-file-text {
    position: absolute;
    left: 0;
    z-index: 3;
    color: #777;
}

.ext-ie6 .x-form-element .x-form-field-wrap .x-form-file-btn, .ext-ie7 .x-form-element .x-form-field-wrap .x-form-file-btn {
    top: 0px;
}

.ext-ie6 .x-form-element .x-form-file-text, .ext-ie7 .x-form-element .x-form-file-text {
    margin-top: 0px;
}

.x-form-file-wrap.x-down-note,
.x-form-file-wrap.x-top-note {
    height: 39px;
}

.x-form-file-wrap.x-down-note .x-field-note {
    padding-top: 22px;
}

.ext-ie6 .x-form-file-wrap.x-top-note .x-form-file-btn,
.ext-ie7 .x-form-file-wrap.x-top-note .x-form-file-btn {
    top: 14px;
}