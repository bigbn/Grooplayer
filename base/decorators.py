# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
import logging

def render_to(template_path):
    """
    декоратор
    в качестве параметра передается шаблон для отрисовки
    декорируемая функция должна возвращать контекст для шаблона, который
    преобразуется в объект RequestContext
    """
    def decorator(func):
        def wrapper(request, *args, **kw):
            no_render = False
            if "no_render" in kw:
                del kw["no_render"]
                no_render = True
            output = func(request, *args, **kw)
            if no_render:
                return output
            if not isinstance(output, dict):
                return output
            return render_to_response(template_path, output,
                context_instance=RequestContext(request))
        return wrapper
    return decorator
